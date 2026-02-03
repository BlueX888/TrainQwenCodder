// 平台跳跃游戏场景
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 状态信号：跳跃次数
    this.isGrounded = false; // 状态信号：是否在地面
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 400, 32);
    groundGraphics.generateTexture('ground', 400, 32);
    groundGraphics.destroy();

    // 创建平台纹理（棕色方块）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加主地面
    this.platforms.create(200, 568, 'ground');
    this.platforms.create(600, 568, 'ground');

    // 添加平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(50, 350, 'platform');
    this.platforms.create(750, 300, 'platform');
    this.platforms.create(400, 200, 'platform');

    // 设置角色与平台碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调，检测是否着地
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
    this.add.text(16, 60, '控制: ← → 移动, 空格/↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置着地状态
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只有在地面时才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
    }

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `着地状态: ${this.isGrounded ? '是' : '否'}`,
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
new Phaser.Game(config);