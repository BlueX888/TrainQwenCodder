class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 状态信号：是否在地面
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(1000); // 设置重力

    // 创建地面组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(100, 250, 'platform');
    this.platforms.create(600, 200, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制说明
    this.add.text(16, 550, '← → 移动  ↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置地面状态
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120); // 移动速度 120
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面时才能跳跃）
    if (this.cursors.up.isDown && this.isGrounded) {
      this.player.setVelocityY(-500); // 跳跃速度
      this.jumpCount++;
      this.updateStatusText();
    }

    // 更新状态文本
    if (wasGrounded !== this.isGrounded) {
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `状态: ${this.isGrounded ? '地面' : '空中'}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
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
      gravity: { y: 0 }, // 场景重力为 0，单独给玩家设置重力
      debug: false
    }
  },
  scene: PlatformJumpScene
};

// 创建游戏实例
new Phaser.Game(config);