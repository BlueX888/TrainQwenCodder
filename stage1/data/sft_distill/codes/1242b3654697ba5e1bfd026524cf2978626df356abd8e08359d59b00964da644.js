class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，不依赖外部资源
    this.createPlayerTexture();
    this.createCoinTexture();
    this.createPlatformTexture();
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(0, 0, 32, 48);
    graphics.generateTexture('player', 32, 48);
    graphics.destroy();
  }

  createCoinTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0xffaa00, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('coin', 32, 32);
    graphics.destroy();
  }

  createPlatformTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d572c, 1);
    graphics.fillRect(0, 0, 400, 32);
    graphics.generateTexture('platform', 400, 32);
    graphics.destroy();
  }

  create() {
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // 创建平台静态组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    this.platforms.create(400, 568, 'platform').setScale(2).refreshBody();

    // 空中平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 350, 'platform').setScale(0.5).refreshBody();
    this.platforms.create(750, 300, 'platform').setScale(0.5).refreshBody();
    this.platforms.create(300, 250, 'platform').setScale(0.6).refreshBody();
    this.platforms.create(500, 150, 'platform').setScale(0.5).refreshBody();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同位置生成 8 个金币
    const coinPositions = [
      { x: 600, y: 330 },
      { x: 50, y: 280 },
      { x: 750, y: 230 },
      { x: 300, y: 180 },
      { x: 500, y: 80 },
      { x: 150, y: 200 },
      { x: 650, y: 100 },
      { x: 400, y: 500 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.2);
      coin.setCollideWorldBounds(true);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家收集金币
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(400, 50, 'Use Arrow Keys to Move and Jump!', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
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

    // 跳跃（只有在地面或平台上才能跳）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
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
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: PlatformGame
};

const game = new Phaser.Game(config);