class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
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
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵（启用物理）
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true); // 限制在世界边界内
    this.player.setBounce(0); // 无弹性

    // 创建地面组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, '方向键←→移动，↑或空格跳跃', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 检测是否在地面上（通过速度判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200); // 向左移动，速度 200
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200); // 向右移动，速度 200
    } else {
      this.player.setVelocityX(0); // 停止水平移动
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isGrounded) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
    }

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `速度: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`
    ]);
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
      debug: false // 设为 true 可查看碰撞边界
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);