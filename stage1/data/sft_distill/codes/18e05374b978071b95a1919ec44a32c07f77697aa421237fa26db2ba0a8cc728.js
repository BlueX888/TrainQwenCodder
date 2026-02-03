class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 状态信号：是否在地面
  }

  preload() {
    // 使用 Graphics 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 使用 Graphics 生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(500); // 设置重力

    // 创建地面平台组（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody(); // 底部主平台
    this.platforms.create(200, 450, 'ground').setScale(1.5, 1).refreshBody(); // 左侧平台
    this.platforms.create(600, 400, 'ground').setScale(1.5, 1).refreshBody(); // 右侧平台
    this.platforms.create(400, 300, 'ground').setScale(1, 1).refreshBody(); // 中间平台

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调：检测是否在地面
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
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
    // 检查是否在地面（用于跳跃控制）
    const touching = this.player.body.touching.down;
    
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80); // 向左移动，速度 80
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80); // 向右移动，速度 80
    } else {
      this.player.setVelocityX(0); // 停止水平移动
    }

    // 跳跃控制（只有在地面时才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && touching) {
      this.player.setVelocityY(-330); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.isGrounded = false;
      this.updateStatusText();
    }

    // 更新地面状态
    if (touching && !this.isGrounded) {
      this.isGrounded = true;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Grounded: ${this.isGrounded ? 'Yes' : 'No'}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Controls:',
      'Arrow Keys / WASD - Move',
      'Space / Up Arrow - Jump'
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
      gravity: { y: 0 }, // 全局重力设为0，在玩家身上单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);