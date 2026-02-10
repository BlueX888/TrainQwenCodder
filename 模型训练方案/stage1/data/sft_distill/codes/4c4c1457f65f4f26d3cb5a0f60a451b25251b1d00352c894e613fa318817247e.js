class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0;
    this.moveDistance = 0;
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
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

    // 创建角色（物理精灵）
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面和平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 575, 'ground');
    
    // 额外平台
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(200, 300, 'platform');
    this.platforms.create(500, 200, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 初始化状态信号
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      jumpCount: this.jumpCount,
      moveDistance: this.moveDistance,
      isGrounded: this.isGrounded,
      velocityX: 0,
      velocityY: 0
    };

    // 添加状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log('Game initialized:', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 重置地面状态
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.moveDistance += Math.abs(200 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.moveDistance += Math.abs(200 * delta / 1000);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只有在地面上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isGrounded) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      console.log('Jump!', JSON.stringify({ jumpCount: this.jumpCount, position: { x: this.player.x, y: this.player.y } }));
    }

    // 更新状态信号
    window.__signals__ = {
      playerX: Math.round(this.player.x * 100) / 100,
      playerY: Math.round(this.player.y * 100) / 100,
      jumpCount: this.jumpCount,
      moveDistance: Math.round(this.moveDistance * 100) / 100,
      isGrounded: this.isGrounded,
      velocityX: Math.round(this.player.body.velocity.x),
      velocityY: Math.round(this.player.body.velocity.y)
    };

    // 更新状态文本
    this.statusText.setText([
      `Position: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
      `Velocity: (${window.__signals__.velocityX}, ${window.__signals__.velocityY})`,
      `Jumps: ${window.__signals__.jumpCount}`,
      `Distance: ${window.__signals__.moveDistance}`,
      `Grounded: ${window.__signals__.isGrounded}`,
      '',
      'Controls: Arrow Keys / SPACE to jump'
    ]);

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      console.log('Status:', JSON.stringify(window.__signals__));
      this.lastLogTime = time;
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);