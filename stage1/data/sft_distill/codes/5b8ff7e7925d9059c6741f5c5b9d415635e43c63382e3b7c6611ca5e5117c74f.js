class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理（黄色圆形）
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffdd00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();

    // 创建平台纹理（绿色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x00aa00, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面纹理（深绿色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x006600, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 580, 'ground');

    // 添加空中平台
    this.platforms.create(150, 450, 'platform');
    this.platforms.create(400, 350, 'platform');
    this.platforms.create(650, 450, 'platform');
    this.platforms.create(250, 250, 'platform');
    this.platforms.create(550, 250, 'platform');
    this.platforms.create(400, 150, 'platform');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与平台碰撞
    this.physics.add.collider(this.player, this.platforms);

    // 创建金币组
    this.coins = this.physics.add.group();

    // 在平台附近分布12个金币
    const coinPositions = [
      { x: 150, y: 400 },
      { x: 200, y: 400 },
      { x: 400, y: 300 },
      { x: 450, y: 300 },
      { x: 650, y: 400 },
      { x: 700, y: 400 },
      { x: 250, y: 200 },
      { x: 300, y: 200 },
      { x: 550, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 100 },
      { x: 450, y: 100 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.3);
      coin.setCollideWorldBounds(true);
    });

    // 设置金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);

    // 设置玩家与金币重叠检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 添加游戏说明文本
    this.add.text(16, 56, 'Arrow Keys: Move | Up: Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
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
      this.player.setVelocityY(-500);
    }
  }

  collectCoin(player, coin) {
    // 销毁金币
    coin.destroy();

    // 增加分数
    this.score += 10;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有金币
    if (this.score === 120) {
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
const game = new Phaser.Game(config);