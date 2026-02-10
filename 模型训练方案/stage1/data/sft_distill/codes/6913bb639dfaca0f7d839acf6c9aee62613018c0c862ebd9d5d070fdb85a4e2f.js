class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(1000);

    // 创建地面和平台
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(700, 200, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃计数
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制提示
    this.add.text(16, 50, 'Controls: Arrow Keys to move, SPACE to jump', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示玩家状态
    this.statusText = this.add.text(16, 80, '', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 只有在地面上才能跳跃
      if (this.player.body.touching.down) {
        this.player.setVelocityY(-500);
        this.jumpCount++;
        this.jumpText.setText('Jumps: ' + this.jumpCount);
      }
    }

    // 更新状态显示
    const velocityY = Math.round(this.player.body.velocity.y);
    const onGround = this.player.body.touching.down;
    this.statusText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) | ` +
      `Velocity Y: ${velocityY} | ` +
      `On Ground: ${onGround}`
    );

    // 重置地面状态
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }
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
      gravity: { y: 0 }, // 重力通过player单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);