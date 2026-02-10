class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理（金色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(200, 450, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(600, 400, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(400, 300, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(150, 250, 'platform').setScale(1.2, 1).refreshBody();
    this.platforms.create(650, 200, 'platform').setScale(1.2, 1).refreshBody();

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度放置5个金币
    const coinPositions = [
      { x: 200, y: 380 },
      { x: 600, y: 330 },
      { x: 400, y: 230 },
      { x: 150, y: 180 },
      { x: 650, y: 130 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 提示文本
    this.hintText = this.add.text(400, 50, 'Collect all 5 coins!\nUse Arrow Keys to move and jump', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.hintText.setOrigin(0.5, 0);

    // 初始化可验证信号
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: 5,
      gameComplete: false,
      playerX: this.player.x,
      playerY: this.player.y
    };

    console.log(JSON.stringify({
      event: 'game_start',
      totalCoins: 5,
      gravity: 800
    }));
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    
    this.score += 100;
    this.coinsCollected++;
    
    this.scoreText.setText('Score: ' + this.score);

    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;

    console.log(JSON.stringify({
      event: 'coin_collected',
      coinsCollected: this.coinsCollected,
      score: this.score,
      remainingCoins: 5 - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 5) {
      this.hintText.setText('YOU WIN! All coins collected!');
      this.hintText.setStyle({ fill: '#00ff00', fontSize: '28px' });
      
      window.__signals__.gameComplete = true;

      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        coinsCollected: this.coinsCollected
      }));
    }
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新玩家位置信号
    if (window.__signals__) {
      window.__signals__.playerX = Math.round(this.player.x);
      window.__signals__.playerY = Math.round(this.player.y);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);