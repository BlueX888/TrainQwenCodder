class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
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
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 580, 'ground');

    // 创建平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(150, 450, 'platform');
    this.platforms.create(400, 350, 'platform');
    this.platforms.create(650, 450, 'platform');
    this.platforms.create(250, 250, 'platform');
    this.platforms.create(550, 250, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在空中随机位置生成10个金币
    const coinPositions = [
      { x: 150, y: 380 },
      { x: 400, y: 280 },
      { x: 650, y: 380 },
      { x: 250, y: 180 },
      { x: 550, y: 180 },
      { x: 300, y: 450 },
      { x: 500, y: 350 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 150 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.ground);
    this.physics.add.collider(this.coins, this.platforms);

    // 金币收集检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(1);

    // 游戏完成文本（初始隐藏）
    this.winText = this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '64px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
    this.winText.setDepth(2);
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
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score >= 100) {
      this.winText.setVisible(true);
      // 可选：暂停游戏
      // this.physics.pause();
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);