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
    // 初始化验证信号
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: 12,
      gameComplete: false
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 中层平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(500, 180, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度和位置生成12个金币
    const coinPositions = [
      { x: 100, y: 300 },
      { x: 250, y: 200 },
      { x: 400, y: 150 },
      { x: 550, y: 130 },
      { x: 700, y: 250 },
      { x: 150, y: 500 },
      { x: 450, y: 350 },
      { x: 650, y: 450 },
      { x: 300, y: 100 },
      { x: 600, y: 100 },
      { x: 750, y: 200 },
      { x: 50, y: 200 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.5);
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
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });

    // 游戏提示
    this.add.text(400, 50, 'Collect all 12 coins!', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 控制提示
    this.add.text(400, 580, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_started',
      totalCoins: 12,
      gravity: 300
    }));
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    
    this.score += 10;
    this.coinsCollected += 1;
    
    this.scoreText.setText('Score: ' + this.score);

    // 更新验证信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;

    console.log(JSON.stringify({
      event: 'coin_collected',
      coinsCollected: this.coinsCollected,
      score: this.score,
      remaining: 12 - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 12) {
      window.__signals__.gameComplete = true;
      
      const winText = this.add.text(400, 300, 'YOU WIN!\nAll coins collected!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5);

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
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面上跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);