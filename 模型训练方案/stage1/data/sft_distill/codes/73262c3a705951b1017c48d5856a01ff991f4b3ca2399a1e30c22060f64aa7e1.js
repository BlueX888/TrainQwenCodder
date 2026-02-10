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
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    this.player.body.setGravityY(1000); // 设置重力
    this.player.setBounce(0); // 无弹跳

    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部主平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody();
    
    // 添加中间平台
    this.platforms.create(600, 400, 'ground').setScale(1, 1).refreshBody();
    this.platforms.create(200, 450, 'ground').setScale(1, 1).refreshBody();
    this.platforms.create(400, 300, 'ground').setScale(1, 1).refreshBody();

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
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

    // 添加控制说明
    this.add.text(16, 50, 'Controls: Arrow Keys to move, SPACE to jump', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Grounded: ${this.isGrounded}`,
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);

    // 重置接地状态（每帧开始时）
    this.isGrounded = false;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120); // 向左移动，速度 120
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120); // 向右移动，速度 120
    } else {
      this.player.setVelocityX(0); // 停止移动
    }

    // 跳跃控制（仅在接地时可跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
    }

    // 检测是否接地（用于下一帧的跳跃判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天空蓝背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 全局重力为 0，在玩家上单独设置
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);