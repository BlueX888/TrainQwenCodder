class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 状态信号：是否在地面
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true); // 限制在世界边界内

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 568, 'ground').setScale(12.5, 1).refreshBody();
    
    // 添加几个平台
    this.platforms.create(600, 450, 'ground').setScale(3, 1).refreshBody();
    this.platforms.create(50, 350, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(750, 300, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(200, 200, 'ground').setScale(2.5, 1).refreshBody();

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.infoText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制提示
    this.add.text(16, 550, '← → 移动  ↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
  }

  update(time, delta) {
    // 检查是否在地面（通过速度判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面时才能跳跃）
    if (this.cursors.up.isDown && this.isGrounded) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
    }

    // 更新信息显示
    this.infoText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isGrounded ? '是' : '否'}`,
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);