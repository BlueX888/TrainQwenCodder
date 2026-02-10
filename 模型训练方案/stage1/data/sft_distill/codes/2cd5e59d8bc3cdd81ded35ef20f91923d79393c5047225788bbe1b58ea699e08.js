class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    // 状态信号变量
    this.jumpCount = 0;
    this.isOnGround = false;
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理（棕色方块）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('platform', 400, 32);
    platformGraphics.destroy();

    // 创建小平台纹理
    const smallPlatformGraphics = this.add.graphics();
    smallPlatformGraphics.fillStyle(0xa0522d, 1);
    smallPlatformGraphics.fillRect(0, 0, 200, 32);
    smallPlatformGraphics.generateTexture('smallPlatform', 200, 32);
    smallPlatformGraphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面和平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();

    // 地面
    this.platforms.create(400, 584, 'platform').setScale(2).refreshBody();

    // 中间平台
    this.platforms.create(600, 400, 'smallPlatform');
    this.platforms.create(50, 300, 'smallPlatform');
    this.platforms.create(700, 250, 'smallPlatform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 当玩家接触平台时，标记为在地面上
      if (this.player.body.touching.down) {
        this.isOnGround = true;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键用于跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 60, '← → 移动  ↑ / 空格 跳跃', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update() {
    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 检测是否离开地面
    if (!this.player.body.touching.down) {
      this.isOnGround = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
      this.isOnGround = false;
    }

    // 更新状态显示
    this.statusText.setText([
      `位置: (${this.playerX}, ${this.playerY})`,
      `跳跃次数: ${this.jumpCount}`,
      `在地面: ${this.isOnGround ? '是' : '否'}`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);