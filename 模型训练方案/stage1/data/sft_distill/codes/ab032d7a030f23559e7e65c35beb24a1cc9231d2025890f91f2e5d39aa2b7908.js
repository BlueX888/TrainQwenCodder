class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.jumpVelocity = -240;
    this.totalJumps = 0; // 可验证的状态信号：总跳跃次数
  }

  preload() {
    // 使用Graphics创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理
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
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 创建一些平台用于测试
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(300, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(200, 250, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, this.onLanding, null, this);
    this.physics.add.collider(this.player, this.platforms, this.onLanding, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(16, 560, 
      '使用 ↑ 或 SPACE 跳跃 | ← → 移动', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 初始化跳跃计数
    this.jumpCount = 0;
    this.updateStatusText();
  }

  update(time, delta) {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                        Phaser.Input.Keyboard.JustDown(this.spaceKey);
    
    if (jumpPressed && this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.totalJumps++; // 累计总跳跃次数
      this.updateStatusText();
    }

    // 更新状态文本
    this.updateStatusText();
  }

  onLanding(player, platform) {
    // 当玩家接触地面或平台时，重置跳跃次数
    if (player.body.touching.down) {
      this.jumpCount = 0;
    }
  }

  updateStatusText() {
    const canJump = this.jumpCount < this.maxJumps;
    const jumpsRemaining = this.maxJumps - this.jumpCount;
    const isGrounded = this.player.body.touching.down;
    
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `剩余跳跃: ${jumpsRemaining}`,
      `可以跳跃: ${canJump ? '是' : '否'}`,
      `接触地面: ${isGrounded ? '是' : '否'}`,
      `总跳跃数: ${this.totalJumps}`,
      `玩家速度Y: ${Math.round(this.player.body.velocity.y)}`
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

new Phaser.Game(config);