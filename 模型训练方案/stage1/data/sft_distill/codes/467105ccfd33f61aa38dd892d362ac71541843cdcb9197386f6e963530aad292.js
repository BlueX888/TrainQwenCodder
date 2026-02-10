class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 1为向右，-1为向左
    this.platformPosition = 0; // 平台当前位置（用于状态验证）
    this.playerOnPlatform = false; // 玩家是否在平台上
  }

  preload() {
    // 创建灰色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1); // 灰色
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();
  }

  create() {
    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(360 * this.platformDirection);

    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建静态地面（用于对比）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x654321, 1);
    groundGraphics.fillRect(0, 550, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform, () => {
      this.playerOnPlatform = true;
    });
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 重置平台状态
    this.playerOnPlatform = false;

    // 平台边界检测和方向反转
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(360 * this.platformDirection);
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(360 * this.platformDirection);
    }

    // 更新平台位置状态
    this.platformPosition = Math.round(this.platform.x);

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持平台的水平速度
      if (this.player.body.touching.down && this.platform.body.touching.up) {
        this.playerOnPlatform = true;
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 更新调试信息
    this.debugText.setText([
      `Platform Position: ${this.platformPosition}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Player Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      '',
      'Controls: Arrow Keys to move player'
    ]);
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);