class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    // 状态信号变量
    this.jumpCount = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.isOnGround = false;
  }

  preload() {
    // 创建角色纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x2ecc71, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();

    // 创建大地面纹理（棕色）
    const baseGroundGraphics = this.add.graphics();
    baseGroundGraphics.fillStyle(0x8b4513, 1);
    baseGroundGraphics.fillRect(0, 0, 800, 60);
    baseGroundGraphics.generateTexture('baseGround', 800, 60);
    baseGroundGraphics.destroy();
  }

  create() {
    // 添加说明文字
    this.add.text(16, 16, 'Arrow Keys: Move & Jump', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(16, 45, '', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 创建角色
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    
    // 创建地面平台组（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加底部大地面
    this.platforms.create(400, 580, 'baseGround').setScale(1).refreshBody();
    
    // 添加多个平台
    this.platforms.create(200, 450, 'ground');
    this.platforms.create(500, 380, 'ground');
    this.platforms.create(100, 280, 'ground');
    this.platforms.create(600, 280, 'ground');
    this.platforms.create(350, 200, 'ground');

    // 设置角色与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isOnGround = true;
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键作为额外的跳跃键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  update(time, delta) {
    // 重置地面状态
    const wasOnGround = this.isOnGround;
    this.isOnGround = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      // 停止时添加阻力
      this.player.setVelocityX(this.player.body.velocity.x * 0.85);
      
      // 速度很小时直接停止
      if (Math.abs(this.player.body.velocity.x) < 10) {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制（只有在地面上才能跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isOnGround) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText(
      `Jumps: ${this.jumpCount} | Pos: (${this.playerX}, ${this.playerY}) | OnGround: ${this.isOnGround}`
    );
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