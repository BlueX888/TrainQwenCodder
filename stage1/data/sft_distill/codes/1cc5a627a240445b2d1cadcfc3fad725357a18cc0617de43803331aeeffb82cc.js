class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.coinsCollected = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      score: 0,
      coinsCollected: 0,
      totalCoins: 5,
      playerY: 0,
      gameComplete: false
    };

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();
    
    // 中间平台
    this.platforms.create(600, 450, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(200, 350, 'platform').setScale(1.5, 1).refreshBody();
    this.platforms.create(500, 250, 'platform').setScale(1.2, 1).refreshBody();
    this.platforms.create(100, 150, 'platform').setScale(1, 1).refreshBody();

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在不同高度创建5个金币
    const coinPositions = [
      { x: 600, y: 380 },
      { x: 200, y: 280 },
      { x: 500, y: 180 },
      { x: 100, y: 80 },
      { x: 400, y: 480 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // 添加金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示提示文本
    this.hintText = this.add.text(16, 56, 'Arrow keys to move, UP to jump', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalCoins: 5,
      gravity: 800
    }));
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.destroy();
    
    // 增加分数
    this.score += 10;
    this.coinsCollected += 1;
    
    // 更新文本
    this.scoreText.setText('Score: ' + this.score);
    
    // 更新信号
    window.__signals__.score = this.score;
    window.__signals__.coinsCollected = this.coinsCollected;
    
    console.log(JSON.stringify({
      event: 'coin_collected',
      score: this.score,
      coinsCollected: this.coinsCollected,
      remaining: 5 - this.coinsCollected
    }));

    // 检查是否收集完所有金币
    if (this.coinsCollected === 5) {
      window.__signals__.gameComplete = true;
      this.hintText.setText('All coins collected! Score: ' + this.score);
      this.hintText.setStyle({ fontSize: '24px', fill: '#00ff00' });
      
      console.log(JSON.stringify({
        event: 'game_complete',
        finalScore: this.score,
        totalCoins: this.coinsCollected
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

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新玩家位置信号
    window.__signals__.playerY = Math.round(this.player.y);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);