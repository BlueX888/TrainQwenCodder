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
    // 创建角色纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理（棕色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();

    // 创建地面纹理（灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 575, 'ground');

    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(150, 250, 'platform');
    this.platforms.create(600, 200, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
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
    this.add.text(16, 50, '← → 移动  SPACE/↑ 跳跃', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update() {
    // 重置接地状态（每帧开始时）
    this.isGrounded = false;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（空格键或上方向键）
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                        Phaser.Input.Keyboard.JustDown(this.cursors.up);
    
    if (jumpPressed && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
    }

    // 更新状态显示
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})\n` +
      `速度: ${Math.floor(this.player.body.velocity.y)}\n` +
      `接地: ${this.player.body.touching.down ? '是' : '否'}`
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: PlatformScene
};

new Phaser.Game(config);