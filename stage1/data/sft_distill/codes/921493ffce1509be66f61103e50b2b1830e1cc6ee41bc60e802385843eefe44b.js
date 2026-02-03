// 平台跳跃游戏场景
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    groundGraphics.generateTexture('ground', 200, 32);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 150, 24);
    platformGraphics.generateTexture('platform', 150, 24);
    platformGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞
    this.player.body.setGravityY(500); // 设置重力

    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加主地面
    this.platforms.create(400, 584, 'ground').setScale(4, 1).refreshBody();

    // 添加多个平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(300, 200, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调：检测是否在地面上
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
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

    // 添加控制说明
    this.add.text(16, 50, 'Controls:\n← → : Move\nSPACE: Jump', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置地面状态
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      // 停止时减速
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑：只有在地面上才能跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++; // 增加跳跃计数
    }

    // 更新状态显示
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Velocity: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`,
      `Grounded: ${this.isGrounded}`
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
      gravity: { y: 0 }, // 全局重力设为0，在玩家上单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);