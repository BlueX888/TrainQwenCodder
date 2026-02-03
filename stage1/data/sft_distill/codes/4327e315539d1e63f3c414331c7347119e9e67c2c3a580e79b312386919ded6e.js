class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    // 状态信号变量
    this.jumpCount = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.isOnGround = false;
  }

  preload() {
    // 不需要加载外部资源，使用程序化生成
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加多个平台
    this.platforms.create(400, 568, 'ground').setScale(4, 1).refreshBody(); // 主地面
    this.platforms.create(600, 400, 'ground'); // 右侧平台
    this.platforms.create(200, 400, 'ground'); // 左侧平台
    this.platforms.create(400, 250, 'ground').setScale(0.5, 1).refreshBody(); // 顶部小平台

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = this.player.body.touching.down;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, 'Arrow Keys: Move | Up Arrow: Jump', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 更新状态变量
    this.playerX = Math.floor(this.player.x);
    this.playerY = Math.floor(this.player.y);
    this.isOnGround = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只在地面上时可以跳跃）
    if (this.cursors.up.isDown && this.isOnGround) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 更新调试信息
    this.debugText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Jump Count: ${this.jumpCount}`,
      `On Ground: ${this.isOnGround}`,
      `Velocity: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`
    ]);
  }
}

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
  scene: PlatformerScene
};

const game = new Phaser.Game(config);