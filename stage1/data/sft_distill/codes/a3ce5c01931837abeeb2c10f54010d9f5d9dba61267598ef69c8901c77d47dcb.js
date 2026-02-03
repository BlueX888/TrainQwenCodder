class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 可验证的状态信号：是否在地面
    this.moveDistance = 0; // 可验证的状态信号：移动距离
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0099ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 创建角色精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true); // 角色不超出世界边界
    this.player.body.setGravityY(200); // 设置重力为 200

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody(); // 主地面
    this.platforms.create(200, 450, 'ground').setScale(1.5, 1).refreshBody(); // 左侧平台
    this.platforms.create(600, 400, 'ground').setScale(1.5, 1).refreshBody(); // 右侧平台
    this.platforms.create(400, 250, 'ground').setScale(1, 1).refreshBody(); // 顶部平台

    // 设置角色与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
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
    this.add.text(16, 60, '← → 移动 | ↑ 或 空格 跳跃', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新状态信息
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `移动距离: ${Math.floor(this.moveDistance)}`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `速度Y: ${Math.floor(this.player.body.velocity.y)}`
    ]);

    // 检测是否在地面（通过垂直速度判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300); // 向左移动，速度 300
      this.moveDistance += Math.abs(delta * 0.3); // 累计移动距离
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300); // 向右移动，速度 300
      this.moveDistance += Math.abs(delta * 0.3);
    } else {
      this.player.setVelocityX(0); // 停止移动
    }

    // 跳跃控制（上方向键或空格键）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isGrounded) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.isGrounded = false; // 离开地面
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 全局重力设为 0，由角色自身重力控制
      debug: false // 设为 true 可查看碰撞边界
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
new Phaser.Game(config);