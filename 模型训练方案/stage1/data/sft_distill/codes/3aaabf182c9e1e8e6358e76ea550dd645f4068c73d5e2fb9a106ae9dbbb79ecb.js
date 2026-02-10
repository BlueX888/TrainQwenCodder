class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.platformPosition = 0;
    this.platformDirection = 1; // 1=右移, -1=左移
    this.playerOnPlatform = false;
  }

  preload() {
    // 创建红色平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff0000, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建蓝色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('playerTex', 40, 50);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x888888, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    const ground = this.physics.add.sprite(400, 575, 'groundTex');
    ground.setImmovable(true);
    ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(400, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.body.setVelocityX(200);
    
    // 设置平台移动边界
    this.platformMinX = 200;
    this.platformMaxX = 600;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 200, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, ground);
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      this.onPlatformCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  onPlatformCollision(player, platform) {
    // 检测玩家是否站在平台上方
    if (player.body.touching.down && platform.body.touching.up) {
      this.playerOnPlatform = true;
    }
  }

  update(time, delta) {
    // 更新平台移动逻辑
    if (this.platform.x >= this.platformMaxX && this.platform.body.velocity.x > 0) {
      this.platform.body.setVelocityX(-200);
      this.platformDirection = -1;
    } else if (this.platform.x <= this.platformMinX && this.platform.body.velocity.x < 0) {
      this.platform.body.setVelocityX(200);
      this.platformDirection = 1;
    }

    // 记录平台位置
    this.platformPosition = Math.round(this.platform.x);

    // 玩家在平台上时，添加平台速度
    if (this.playerOnPlatform && this.player.body.touching.down) {
      // 玩家跟随平台移动
      this.player.x += this.platform.body.velocity.x * (delta / 1000);
    }

    // 重置平台状态标记
    this.playerOnPlatform = false;

    // 玩家左右移动控制
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

    // 更新调试信息
    this.debugText.setText([
      `Platform Position: ${this.platformPosition}`,
      `Platform Direction: ${this.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
      `Platform Velocity: ${Math.round(this.platform.body.velocity.x)}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Player On Platform: ${this.player.body.touching.down && this.physics.overlap(this.player, this.platform)}`,
      '',
      'Controls: Arrow Keys to Move, Up to Jump'
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