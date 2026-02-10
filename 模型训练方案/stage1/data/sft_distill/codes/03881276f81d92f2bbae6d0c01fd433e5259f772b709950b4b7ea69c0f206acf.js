class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(16, 16, 16);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建小平台纹理
    const smallPlatformGraphics = this.add.graphics();
    smallPlatformGraphics.fillStyle(0x888888, 1);
    smallPlatformGraphics.fillRect(0, 0, 200, 24);
    smallPlatformGraphics.generateTexture('smallPlatform', 200, 24);
    smallPlatformGraphics.destroy();

    // 创建地面平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 584, 'platform').setScale(2, 1).refreshBody();
    
    // 创建空中平台
    this.platforms.create(600, 450, 'smallPlatform');
    this.platforms.create(200, 380, 'smallPlatform');
    this.platforms.create(700, 300, 'smallPlatform');
    this.platforms.create(150, 250, 'smallPlatform');
    this.platforms.create(500, 200, 'smallPlatform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 添加玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();
    
    // 在空中平台上方创建5个金币
    const coinPositions = [
      { x: 600, y: 400 },
      { x: 200, y: 330 },
      { x: 700, y: 250 },
      { x: 150, y: 200 },
      { x: 500, y: 150 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 玩家与金币碰撞检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);

    // 创建提示文本
    this.hintText = this.add.text(400, 50, 'Use Arrow Keys to Move and Jump!\nCollect all 5 coins!', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.hintText.setOrigin(0.5);
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

    // 跳跃控制（只有在地面或平台上才能跳跃）
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查是否收集完所有金币
    if (this.score >= 5 && this.coins.countActive(true) === 0) {
      if (!this.winText) {
        this.winText = this.add.text(400, 300, 'YOU WIN!\nAll coins collected!', {
          fontSize: '48px',
          fill: '#00ff00',
          align: 'center',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6
        });
        this.winText.setOrigin(0.5);
      }
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.disableBody(true, true);
    
    // 增加分数
    this.score += 1;
    this.scoreText.setText('Score: ' + this.score);

    // 添加收集音效的视觉反馈（闪烁效果）
    this.cameras.main.flash(100, 255, 255, 0);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);