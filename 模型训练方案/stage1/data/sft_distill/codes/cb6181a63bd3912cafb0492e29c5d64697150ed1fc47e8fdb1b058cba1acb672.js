class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
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
    groundGraphics.fillRect(0, 0, 800, 32);
    groundGraphics.generateTexture('ground', 800, 32);
    groundGraphics.destroy();

    // 创建平台纹理（棕色小平台）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 24);
    platformGraphics.generateTexture('platform', 200, 24);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0); // 无弹跳
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    this.player.body.setGravityY(0); // 玩家自身重力由全局重力控制

    // 创建静态地面组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 584, 'ground');
    
    // 添加几个悬空平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(200, 350, 'platform');
    this.platforms.create(500, 250, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调：检测是否在地面上
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加操作说明
    this.add.text(16, 50, '← → 移动  ↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新地面状态（每帧检测）
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制（速度 360）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      // 停止移动时减速
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if (this.cursors.up.isDown && this.isGrounded) {
      this.player.setVelocityY(-500); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
    }

    // 更新状态显示
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `在地面: ${this.isGrounded ? '是' : '否'}`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 全局重力设置为 500
      debug: false // 设置为 true 可显示物理边界调试信息
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);