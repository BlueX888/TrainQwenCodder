class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
    this.collectedCoins = 0;
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
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xFFD700, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.lineStyle(2, 0xFFA500);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();
  }

  create() {
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(10);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    this.platforms.create(400, 580, 'platform').setScale(4, 1).refreshBody();

    // 空中平台
    this.platforms.create(150, 480, 'platform');
    this.platforms.create(350, 420, 'platform');
    this.platforms.create(550, 360, 'platform');
    this.platforms.create(700, 300, 'platform');
    this.platforms.create(250, 280, 'platform');
    this.platforms.create(500, 220, 'platform');
    this.platforms.create(650, 160, 'platform');
    this.platforms.create(100, 180, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台上方生成金币
    const coinPositions = [
      { x: 150, y: 440 },
      { x: 200, y: 440 },
      { x: 350, y: 380 },
      { x: 400, y: 380 },
      { x: 550, y: 320 },
      { x: 600, y: 320 },
      { x: 700, y: 260 },
      { x: 750, y: 260 },
      { x: 250, y: 240 },
      { x: 300, y: 240 },
      { x: 500, y: 180 },
      { x: 550, y: 180 },
      { x: 650, y: 120 },
      { x: 700, y: 120 },
      { x: 100, y: 140 },
      { x: 150, y: 140 },
      { x: 400, y: 500 },
      { x: 450, y: 500 },
      { x: 200, y: 350 },
      { x: 600, y: 450 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加完成提示文本（初始隐藏）
    this.completeText = this.add.text(400, 300, 'All Coins Collected!\nScore: 20/20', {
      fontSize: '32px',
      fill: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
    this.completeText.setDepth(20);
  }

  collectCoin(player, coin) {
    coin.disableBody(true, true);
    this.score += 1;
    this.collectedCoins += 1;
    this.scoreText.setText(`Score: ${this.score} / 20`);

    // 检查是否收集完所有金币
    if (this.collectedCoins >= 20) {
      this.completeText.setVisible(true);
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

    // 跳跃（只能在地面或平台上跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
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
  scene: PlatformGame
};

const game = new Phaser.Game(config);