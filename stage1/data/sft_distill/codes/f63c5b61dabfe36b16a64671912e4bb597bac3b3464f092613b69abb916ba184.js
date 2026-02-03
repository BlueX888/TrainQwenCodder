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
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 生成地面纹理（绿色平台）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x22aa22, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 生成平台纹理（棕色）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建地面和平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 575, 'ground');
    
    // 添加几个悬浮平台
    this.platforms.create(300, 450, 'platform');
    this.platforms.create(600, 350, 'platform');
    this.platforms.create(200, 250, 'platform');

    // 设置碰撞
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
    this.add.text(16, 50, '← → 移动  ↑/空格 跳跃', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `速度: ${Math.floor(this.player.body.velocity.x)}\n` +
      `着地: ${this.player.body.touching.down ? '是' : '否'}`
    );

    // 重置水平速度
    this.player.setVelocityX(0);

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    }

    // 跳跃逻辑
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-350);
      this.jumpCount++;
    }

    // 更新着地状态
    this.isGrounded = this.player.body.touching.down;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);