class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x8B4513, 1);
    platformGraphics.fillRect(0, 0, 200, 32);
    platformGraphics.generateTexture('platform', 200, 32);
    platformGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    
    // 创建地面平台组（静态物理组）
    this.platforms = this.physics.add.staticGroup();
    
    // 添加地面
    this.platforms.create(400, 568, 'platform').setScale(4, 1).refreshBody();
    
    // 添加几个悬浮平台
    this.platforms.create(600, 450, 'platform');
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(400, 350, 'platform').setScale(0.8, 1).refreshBody();
    this.platforms.create(100, 250, 'platform').setScale(0.6, 1).refreshBody();
    this.platforms.create(700, 250, 'platform').setScale(0.6, 1).refreshBody();
    
    // 设置碰撞检测
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 检测玩家是否在地面上（通过速度判断）
    if (this.player.body.touching.down) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    } else {
      this.player.setVelocityX(0);
    }
    
    // 跳跃（只有在地面上才能跳）
    if (this.cursors.up.isDown && this.isGrounded) {
      this.player.setVelocityY(-330);
      this.jumpCount++;
      this.updateStatusText();
    }
    
    // 更新状态文本
    if (time % 100 < delta) { // 每100ms更新一次
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    const x = Math.floor(this.player.x);
    const y = Math.floor(this.player.y);
    const velocityY = Math.floor(this.player.body.velocity.y);
    
    this.statusText.setText([
      `Jump Count: ${this.jumpCount}`,
      `Position: (${x}, ${y})`,
      `Grounded: ${this.isGrounded}`,
      `Velocity Y: ${velocityY}`
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
  scene: PlatformScene
};

const game = new Phaser.Game(config);