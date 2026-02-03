class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 状态信号：1为向右，-1为向左
    this.platformSpeed = 160;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platformTex', 200, 32);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerTex', 32, 48);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建静态地面（用于测试）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('groundTex', 800, 32);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 584, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(200, 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platform);
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Player on Platform: ${this.physics.world.overlap(this.player, this.platform)}`
    ]);

    // 平台往返移动逻辑
    // 检测平台是否到达边界（左边界100，右边界700）
    if (this.platform.x <= 100 && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= 700 && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
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
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);