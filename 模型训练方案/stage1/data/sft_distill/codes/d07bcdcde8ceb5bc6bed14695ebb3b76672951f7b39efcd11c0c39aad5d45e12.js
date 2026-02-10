class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色矩形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理（棕色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建角色精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞时标记为在地面上
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加控制说明
    this.add.text(16, 60, '← → 移动  空格/↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置地面状态（每帧检测）
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制（速度 300）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      // 停止时添加阻力效果
      this.player.setVelocityX(this.player.body.velocity.x * 0.85);
      
      // 速度很小时直接停止
      if (Math.abs(this.player.body.velocity.x) < 10) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制（空格键或上方向键）
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                       Phaser.Input.Keyboard.JustDown(this.cursors.up);
    
    if (jumpPressed && this.isGrounded) {
      this.player.setVelocityY(-500); // 跳跃力度
      this.jumpCount++; // 增加跳跃计数
      this.updateStatusText();
    }

    // 更新状态文本（显示速度信息）
    if (time % 100 < delta) { // 每100ms更新一次，减少性能开销
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const vx = Math.round(this.player.body.velocity.x);
    const vy = Math.round(this.player.body.velocity.y);
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `速度: X=${vx} Y=${vy}\n` +
      `状态: ${this.isGrounded ? '地面' : '空中'}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb', // 天空蓝背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 }, // 重力设置为 600
      debug: false // 设置为 true 可查看物理边界
    }
  },
  scene: PlatformScene
};

// 启动游戏
new Phaser.Game(config);