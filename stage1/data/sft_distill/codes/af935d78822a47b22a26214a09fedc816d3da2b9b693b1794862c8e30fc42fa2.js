class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 创建玩家精灵（带物理）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true); // 限制在世界边界内
    this.player.setBounce(0); // 无弹性

    // 创建地面平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody(); // 底部主平台
    this.platforms.create(200, 450, 'ground').setScale(1, 1).refreshBody(); // 左侧平台
    this.platforms.create(600, 400, 'ground').setScale(1, 1).refreshBody(); // 右侧平台
    this.platforms.create(400, 300, 'ground').setScale(1, 1).refreshBody(); // 中间平台

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      // 当玩家与平台碰撞时，标记为在地面上
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃次数文本
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示控制提示
    this.add.text(16, 50, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 检测是否在地面上
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动（速度 200）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑（空格键或上方向键）
    const jumpKeyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                          Phaser.Input.Keyboard.JustDown(this.cursors.up);
    
    if (jumpKeyPressed && this.isGrounded) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.jumpText.setText('Jumps: ' + this.jumpCount);
      this.isGrounded = false;
    }
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
      gravity: { y: 500 }, // 重力设置为 500
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);