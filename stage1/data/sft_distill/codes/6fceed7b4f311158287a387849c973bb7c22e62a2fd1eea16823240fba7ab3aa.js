// 完整的 Phaser3 平台跳跃游戏
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody(); // 底部地面
    this.platforms.create(600, 450, 'ground'); // 右侧平台
    this.platforms.create(200, 450, 'ground'); // 左侧平台
    this.platforms.create(400, 350, 'ground').setScale(0.8, 1).refreshBody(); // 中间平台

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调，检测是否在地面上
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

    // 添加说明文字
    this.add.text(16, 50, '← → 移动  空格/↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `速度: ${Math.abs(this.player.body.velocity.x).toFixed(0)}\n` +
      `高度: ${(600 - this.player.y).toFixed(0)}`
    );

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      // 没有按键时停止水平移动
      this.player.setVelocityX(0);
    }

    // 跳跃控制（空格键或上方向键）
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                       Phaser.Input.Keyboard.JustDown(this.spaceKey);
    
    if (jumpPressed && this.player.body.touching.down) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.isGrounded = false;
    }

    // 检测是否离开地面
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天空蓝背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // 重力设置为 300
      debug: false // 设置为 true 可查看物理边界
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);