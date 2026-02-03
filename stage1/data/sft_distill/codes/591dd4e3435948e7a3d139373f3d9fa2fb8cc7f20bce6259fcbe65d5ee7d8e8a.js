class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（棕色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 400, 50);
    groundGraphics.generateTexture('ground', 400, 50);
    groundGraphics.destroy();

    // 创建平台纹理（灰色矩形）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x808080, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 创建地面和平台组（静态物理对象）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(200, 575, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(600, 575, 'ground').setScale(2, 1).refreshBody();
    
    // 添加几个平台
    this.platforms.create(400, 450, 'platform');
    this.platforms.create(150, 350, 'platform');
    this.platforms.create(650, 350, 'platform');
    this.platforms.create(400, 250, 'platform');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示跳跃次数
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制说明
    this.add.text(16, 50, 'Controls: Arrow Keys to move, SPACE to jump', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置背景色
    this.cameras.main.setBackgroundColor('#87CEEB');
  }

  update(time, delta) {
    // 重置接地状态（将在碰撞回调中更新）
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.body.touching.down;

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      this.jumpText.setText('Jumps: ' + this.jumpCount);
    }

    // 调试信息：显示玩家位置和速度
    if (this.debugText) {
      this.debugText.destroy();
    }
    this.debugText = this.add.text(16, 90, 
      `Pos: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}) | ` +
      `Vel: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)}) | ` +
      `Grounded: ${this.isGrounded}`, {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: PlatformGame
};

new Phaser.Game(config);