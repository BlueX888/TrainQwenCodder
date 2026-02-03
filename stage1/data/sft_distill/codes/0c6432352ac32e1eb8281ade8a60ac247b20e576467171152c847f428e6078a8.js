class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.jumpCount = 0; // 可验证状态：跳跃次数
    this.moveDistance = 0; // 可验证状态：移动距离
    this.isGrounded = false; // 可验证状态：是否在地面
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面平台纹理（绿色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x2ecc71, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建小平台纹理（棕色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建角色物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0); // 无弹跳
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面和平台（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 575, 'ground');
    
    // 额外平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(400, 300, 'platform');

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 550, '← → 移动  ↑ 跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    console.log('Platform game created - Use arrow keys to move and jump');
  }

  update(time, delta) {
    // 重置地面状态
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
      this.moveDistance += Math.abs(360 * delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
      this.moveDistance += Math.abs(360 * delta / 1000);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面跳跃）
    if (this.cursors.up.isDown && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      console.log(`Jump #${this.jumpCount}`);
    }

    // 更新状态显示
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `移动距离: ${Math.floor(this.moveDistance)}`,
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
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: PlatformerScene
};

// 创建游戏实例
const game = new Phaser.Game(config);