class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformDirection = 1; // 状态信号：1表示向右，-1表示向左
    this.platformSpeed = 300;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xffff00, 1); // 黄色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true); // 平台不受碰撞影响
    this.platform.body.allowGravity = false; // 平台不受重力影响
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 创建静态地面（用于玩家初始站立）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1); // 灰色
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    this.ground = this.physics.add.sprite(400, 575, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
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
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Platform Direction: ${this.platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Player X: ${Math.round(this.player.x)}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Player on Platform: ${this.physics.world.overlap(this.player, this.platform)}`
    ]);

    // 平台边界检测和方向反转
    if (this.platform.x <= 100) {
      this.platformDirection = 1; // 向右
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= 700) {
      this.platformDirection = -1; // 向左
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家站在平台上，跟随平台移动
      if (this.player.body.touching.down && this.physics.world.overlap(this.player, this.platform)) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
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
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 设置重力为500
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);