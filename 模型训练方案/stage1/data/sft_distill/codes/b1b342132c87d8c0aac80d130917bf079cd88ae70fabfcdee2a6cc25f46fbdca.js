class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformBounces = 0; // 状态信号：平台反弹次数
    this.playerOnPlatform = false; // 状态信号：玩家是否在平台上
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建粉色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff69b4, 1); // 粉色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169e1, 1); // 蓝色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建静态地面
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 350, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(300); // 初始向右移动
    
    // 设置平台移动边界
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlatformCollision,
      null,
      this
    );
    
    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  onPlatformCollision(player, platform) {
    // 检测玩家是否在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 平台往返移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platform.x = this.platformMinX;
      this.platform.setVelocityX(300); // 向右移动
      this.platformBounces++;
    } else if (this.platform.x >= this.platformMaxX) {
      this.platform.x = this.platformMaxX;
      this.platform.setVelocityX(-300); // 向左移动
      this.platformBounces++;
    }

    // 检测玩家是否离开平台
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }

    // 玩家键盘控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，保持相对静止（跟随平台移动）
      if (this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新状态显示
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Platform Bounces: ${this.platformBounces}`,
      `Player On Platform: ${this.playerOnPlatform}`,
      `Platform X: ${Math.round(this.platform.x)}`,
      `Platform Velocity: ${this.platform.body.velocity.x}`,
      `Player Y: ${Math.round(this.player.y)}`,
      `Use Arrow Keys to Move and Jump`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 }, // 重力设置为1000
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);