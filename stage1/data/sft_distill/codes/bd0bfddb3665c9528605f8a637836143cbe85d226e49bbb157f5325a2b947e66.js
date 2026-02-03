class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
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

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制说明
    this.add.text(16, 50, 'Controls: Arrow Keys to move, SPACE to jump', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新接地状态（每帧重置，由碰撞回调更新）
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 更新状态显示
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Velocity: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`,
      `Grounded: ${this.isGrounded}`
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);