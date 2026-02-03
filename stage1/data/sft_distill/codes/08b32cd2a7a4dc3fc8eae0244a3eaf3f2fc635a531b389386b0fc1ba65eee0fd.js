class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
    this.totalCoins = 12;
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
      playerX: 0,
      playerY: 0,
      gameComplete: false
    };

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中层平台
    this.platforms.create(200, 450, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(600, 400, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(100, 300, 'platform').setScale(1.2, 1).refreshBody();
    this.platforms.create(700, 300, 'platform').setScale(1.2, 1).refreshBody();
    this.platforms.create(400, 200, 'platform').setScale(1.5, 1).refreshBody();

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 分布12个金币在不同位置
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 250, y: 380 },
      { x: 600, y: 350 },
      { x: 650, y: 330 },
      { x: 100, y: 250 },
      { x: 150, y: 230 },
      { x: 700, y: 250 },
      { x: 750, y: 230 },
      { x: 350, y: 150 },
      { x: 400, y: 130 },
      { x: 450, y: 150 },
      { x: 500, y: 500 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 添加重叠检测（收集金币）
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 显示收集进度
    this.progressText = this.add.text(16, 56, 'Coins: 0/12', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalCoins: this.totalCoins,
      gravity: 300
    }));
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

    // 跳跃（只能在地面或平台上跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新验证信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.gameComplete = this.coinsCollected >= this.totalCoins;
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 10;
    this.coinsCollected++;
    
    // 更新文本
    this.scoreText.setText('Score: ' + this.score);
    this.progressText.setText('Coins: ' + this.coinsCollected + '/' + this.totalCoins);
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'coin_collected',
      score: this.score,
      coinsCollected: this.coinsCollected,
      remaining: this.totalCoins - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected >= this.totalCoins) {
      const victoryText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      });
      victoryText.setOrigin(0.5);
      
      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        totalCoins: this.coinsCollected
      }));
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);