class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 使用 Graphics 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 使用 Graphics 生成地面纹理（绿色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00cc00, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 使用 Graphics 生成平台纹理（棕色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 底部地面
    this.platforms.create(400, 570, 'ground');
    
    // 中间平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(700, 250, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加空格键用于跳跃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃次数文本
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(16, 50, 'Controls: Arrow Keys / SPACE to Jump', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 重置接地状态（将在碰撞回调中更新）
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      this.jumpText.setText('Jumps: ' + this.jumpCount);
    }

    // 更新玩家颜色指示状态（接地时蓝色，空中时红色）
    if (this.isGrounded) {
      this.player.setTint(0x0088ff);
    } else {
      this.player.setTint(0xff0088);
    }
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
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: PlatformScene
};

const game = new Phaser.Game(config);