class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00ff00, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 主地面
    this.platforms.create(400, 568, 'ground').setScale(12.5, 1).refreshBody();
    
    // 额外平台
    this.platforms.create(600, 400, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(50, 250, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(750, 220, 'ground').setScale(2, 1).refreshBody();

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(400, 50, '← → 移动  SPACE/↑ 跳跃', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置接地状态（每帧检测）
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑（空格键或上方向键）
    const jumpKeyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                          Phaser.Input.Keyboard.JustDown(this.cursors.up);
    
    if (jumpKeyPressed && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `接地: ${this.isGrounded ? '是' : '否'}`
    );
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);