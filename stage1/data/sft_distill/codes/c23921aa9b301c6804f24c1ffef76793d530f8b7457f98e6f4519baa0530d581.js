class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建角色纹理（使用 Graphics）
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 创建多个平台
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      this.isGrounded = true;
    });
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置接地状态（每帧检测）
    const touchingDown = this.player.body.touching.down;
    this.isGrounded = touchingDown;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-330);
      this.jumpCount++;
      this.updateStatusText();
    }

    // 如果玩家掉落到底部，重置位置
    if (this.player.y > 600) {
      this.player.setPosition(400, 100);
      this.player.setVelocity(0, 0);
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Jump Count: ${this.jumpCount}\n` +
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `Grounded: ${this.isGrounded}`
    );
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
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);