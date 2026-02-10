class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformX = 0;
    this.platformVelocity = 240;
    this.playerOnPlatform = false;
    this.platformDirection = 1; // 1为右，-1为左
  }

  preload() {
    // 创建蓝色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x0000ff, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（棕色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建静态平台组（地面）
    const platforms = this.physics.add.staticGroup();
    const ground = platforms.create(400, 575, 'ground');

    // 创建移动平台
    this.movingPlatform = this.physics.add.sprite(200, 400, 'platform');
    this.movingPlatform.setImmovable(true);
    this.movingPlatform.body.allowGravity = false;
    this.movingPlatform.setVelocityX(this.platformVelocity);

    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, this.movingPlatform, () => {
      // 检查玩家是否在平台上方
      if (this.player.body.touching.down && this.movingPlatform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加信息文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置玩家在平台上的状态
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    this.platformX = this.movingPlatform.x;

    // 检查平台边界并反转方向
    if (this.movingPlatform.x <= this.platformMinX) {
      this.movingPlatform.setVelocityX(this.platformVelocity);
      this.platformDirection = 1;
    } else if (this.movingPlatform.x >= this.platformMaxX) {
      this.movingPlatform.setVelocityX(-this.platformVelocity);
      this.platformDirection = -1;
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检查玩家是否在移动平台上
    if (this.player.body.touching.down && this.movingPlatform.body.touching.up) {
      const playerLeft = this.player.body.left;
      const playerRight = this.player.body.right;
      const platformLeft = this.movingPlatform.body.left;
      const platformRight = this.movingPlatform.body.right;

      // 检查水平重叠
      if (playerRight > platformLeft && playerLeft < platformRight) {
        this.playerOnPlatform = true;
      }
    }

    // 更新信息显示
    this.infoText.setText([
      `Platform X: ${Math.round(this.platformX)}`,
      `Platform Direction: ${this.platformDirection > 0 ? 'Right' : 'Left'}`,
      `Platform Velocity: ${Math.round(this.movingPlatform.body.velocity.x)}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Y: ${Math.round(this.player.y)}`,
      '',
      'Controls: Arrow Keys to Move, Up to Jump'
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);