class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.platforms = null;
    this.coins = null;
    this.cursors = null;
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
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();
  }

  create() {
    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 地面平台
    const ground = this.platforms.create(400, 568, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 左侧平台
    this.platforms.create(200, 450, 'platform');

    // 中间平台
    this.platforms.create(400, 350, 'platform');

    // 右侧平台
    this.platforms.create(600, 450, 'platform');

    // 高处平台
    this.platforms.create(400, 200, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同位置创建8个金币
    const coinPositions = [
      { x: 200, y: 380 },
      { x: 400, y: 280 },
      { x: 600, y: 380 },
      { x: 150, y: 250 },
      { x: 650, y: 250 },
      { x: 400, y: 130 },
      { x: 300, y: 500 },
      { x: 500, y: 500 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置金币收集检测
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加游戏说明
    this.add.text(16, 56, 'Arrow Keys: Move & Jump', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
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

    // 跳跃（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.add.text(400, 300, 'You Win!', {
        fontSize: '64px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
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