class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpForce = -240; // 跳跃力度（负值向上）
    this.statusText = null;
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
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建地面（静态物理对象）
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setOrigin(0.5, 0.5);
    this.ground.refreshBody();

    // 创建平台
    this.platform = this.physics.add.staticSprite(300, 400, 'platform');
    this.platform.setOrigin(0.5, 0.5);
    this.platform.refreshBody();

    // 创建玩家（动态物理对象）
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.updateStatusText();
      }
    });

    this.physics.add.collider(this.player, this.platform, () => {
      // 着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.updateStatusText();
      }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文本
    this.add.text(16, 50, '空格键跳跃 (最多2次)\n方向键左右移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加可视化辅助线
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.lineBetween(0, 300, 800, 300);
    graphics.lineBetween(0, 450, 800, 450);
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

    // 双跳逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpForce);
        this.jumpCount++;
        this.updateStatusText();
        
        // 视觉反馈：跳跃时改变颜色
        if (this.jumpCount === 1) {
          this.player.setTint(0x00ff00); // 第一次跳跃：绿色
        } else if (this.jumpCount === 2) {
          this.player.setTint(0xffff00); // 第二次跳跃：黄色
        }
      }
    }

    // 着地时恢复颜色
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.player.clearTint();
    }

    // 更新状态文本（显示速度信息）
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const velocityY = Math.round(this.player.body.velocity.y);
    const isGrounded = this.player.body.touching.down;
    
    this.statusText.setText([
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}`,
      `垂直速度: ${velocityY}`,
      `状态: ${isGrounded ? '着地' : '空中'}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 }, // 重力设置为800
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
new Phaser.Game(config);