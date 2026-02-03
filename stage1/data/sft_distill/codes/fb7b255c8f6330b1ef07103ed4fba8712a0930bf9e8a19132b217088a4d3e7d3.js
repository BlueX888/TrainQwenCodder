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
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();
  }

  create() {
    // 初始化分数
    this.score = 0;

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setDepth(100);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 地面平台
    const ground = this.platforms.create(400, 584, 'platform');
    ground.setScale(4, 1).refreshBody();

    // 中层平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(100, 350, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(300, 250, 'platform');
    this.platforms.create(700, 250, 'platform');
    this.platforms.create(150, 150, 'platform');
    this.platforms.create(550, 150, 'platform');

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在不同高度创建12个金币
    const coinPositions = [
      { x: 200, y: 400 },
      { x: 600, y: 400 },
      { x: 100, y: 300 },
      { x: 500, y: 300 },
      { x: 300, y: 200 },
      { x: 700, y: 200 },
      { x: 150, y: 100 },
      { x: 550, y: 100 },
      { x: 400, y: 350 },
      { x: 250, y: 150 },
      { x: 650, y: 300 },
      { x: 450, y: 100 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // 设置收集金币的重叠检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 游戏完成标志
    this.gameComplete = false;
  }

  collectCoin(player, coin) {
    // 移除金币
    coin.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.coins.countActive(true) === 0) {
      this.gameComplete = true;
      const winText = this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      });
      winText.setOrigin(0.5);
      winText.setDepth(100);
    }
  }

  update(time, delta) {
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);