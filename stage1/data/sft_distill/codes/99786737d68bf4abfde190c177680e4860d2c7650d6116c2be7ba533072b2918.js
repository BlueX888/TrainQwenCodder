class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色长方形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建平台纹理（棕色方块）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建角色物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部地面
    this.platforms.create(400, 570, 'ground');
    
    // 添加几个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 设置角色与地面的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃次数文本
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(16, 50, 'Controls: ← → to move, SPACE to jump', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');
  }

  update(time, delta) {
    // 重置地面状态
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑（只有在地面上才能跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-400); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.jumpText.setText('Jumps: ' + this.jumpCount);
    }

    // 限制最大下落速度
    if (this.player.body.velocity.y > 600) {
      this.player.setVelocityY(600);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 }, // 重力设置为500
      debug: false
    }
  },
  scene: PlatformScene,
  backgroundColor: '#87ceeb'
};

// 创建游戏实例
const game = new Phaser.Game(config);