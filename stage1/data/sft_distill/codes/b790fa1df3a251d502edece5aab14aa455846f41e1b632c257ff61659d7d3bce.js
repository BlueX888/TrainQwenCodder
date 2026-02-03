class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');
    this.ground.refreshBody();

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    const platformPositions = [
      { x: 150, y: 480 },
      { x: 400, y: 400 },
      { x: 650, y: 320 },
      { x: 200, y: 260 },
      { x: 500, y: 200 },
      { x: 700, y: 140 }
    ];

    platformPositions.forEach(pos => {
      this.platforms.create(pos.x, pos.y, 'platform');
    });

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与地面和平台的碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台附近生成8个金币
    const coinPositions = [
      { x: 150, y: 430 },
      { x: 400, y: 350 },
      { x: 650, y: 270 },
      { x: 200, y: 210 },
      { x: 500, y: 150 },
      { x: 700, y: 90 },
      { x: 300, y: 330 },
      { x: 550, y: 240 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.ground);
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // 添加游戏说明
    this.add.text(400, 50, 'Use Arrow Keys to Move, Space/Up to Jump', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    console.log('Game initialized. Score:', this.score);
  }

  update() {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只能在地面或平台上跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.score === 8 && this.coins.countActive(true) === 0) {
      if (!this.winText) {
        this.winText = this.add.text(400, 300, 'You Win! All Coins Collected!', {
          fontSize: '40px',
          fill: '#ffd700',
          backgroundColor: '#000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        console.log('Game completed! Final score:', this.score);
      }
    }
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);
    
    console.log('Coin collected! Current score:', this.score);

    // 添加收集特效（简单的文字提示）
    const collectText = this.add.text(coin.x, coin.y, '+1', {
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: collectText,
      y: coin.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        collectText.destroy();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: PlatformGame
};

// 启动游戏
const game = new Phaser.Game(config);