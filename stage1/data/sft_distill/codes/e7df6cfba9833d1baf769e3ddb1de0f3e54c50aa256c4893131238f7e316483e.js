class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 状态信号：1为向右，-1为向左
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
    this.platformSpeed = 240;
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

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.body.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platform');
    this.platform.body.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      // 检测玩家是否真的站在平台上（而不是从下方碰撞）
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
      }
    });

    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置平台状态标志
    this.playerOnPlatform = false;

    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 检测玩家是否在平台上
    if (this.player.body.touching.down && this.platform.body.touching.up) {
      this.playerOnPlatform = true;
      
      // 玩家跟随平台移动
      const platformVelocity = this.platform.body.velocity.x;
      this.player.x += platformVelocity * (delta / 1000);
    }

    // 玩家左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果在平台上，保持平台的速度
      if (!this.playerOnPlatform) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player X: ${Math.round(this.player.x)}`,
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
  backgroundColor: '#87ceeb',
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