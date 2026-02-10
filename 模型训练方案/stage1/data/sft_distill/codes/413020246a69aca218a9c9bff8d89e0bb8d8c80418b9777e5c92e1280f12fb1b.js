class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 300;
    this.playerOnPlatform = false;
    this.platformDirection = 1; // 1: 右移, -1: 左移
    this.playerX = 400; // 状态信号：玩家X坐标
    this.playerY = 300; // 状态信号：玩家Y坐标
    this.platformX = 200; // 状态信号：平台X坐标
  }

  preload() {
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
  }

  create() {
    // 创建地面（静态平台）
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platform');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动范围
    this.platformMinX = 100;
    this.platformMaxX = 700;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);

    // 添加碰撞检测
    this.platformCollider = this.physics.add.collider(
      this.player,
      this.platform,
      this.handlePlatformCollision,
      null,
      this
    );

    this.physics.add.collider(this.player, this.ground);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 50, '使用方向键移动，跳到粉色平台上体验跟随移动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  handlePlatformCollision(player, platform) {
    // 检测玩家是否站在平台上（玩家底部接触平台顶部）
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台移动逻辑
    if (this.platform.x <= this.platformMinX) {
      this.platformDirection = 1; // 向右移动
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    } else if (this.platform.x >= this.platformMaxX) {
      this.platformDirection = -1; // 向左移动
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
    }

    // 检测玩家是否离开平台
    if (!this.player.body.touching.down) {
      this.playerOnPlatform = false;
    }

    // 玩家在平台上时，跟随平台移动
    if (this.playerOnPlatform && this.player.body.touching.down) {
      // 给玩家施加平台的速度，使其跟随移动
      this.player.setVelocityX(
        this.platform.body.velocity.x + (this.cursors.left.isDown ? -200 : 0) + (this.cursors.right.isDown ? 200 : 0)
      );
    } else {
      // 玩家不在平台上时的正常移动控制
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.playerOnPlatform = false;
    }

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.platformX = Math.round(this.platform.x);

    // 更新状态文本
    this.statusText.setText([
      `玩家位置: (${this.playerX}, ${this.playerY})`,
      `平台位置: ${this.platformX}`,
      `平台方向: ${this.platformDirection > 0 ? '右' : '左'}`,
      `玩家在平台上: ${this.playerOnPlatform ? '是' : '否'}`
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);