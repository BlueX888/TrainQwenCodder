class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.totalJumps = 0; // 总跳跃计数（用于验证）
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -240; // 跳跃力度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 575, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建说明文本
    this.add.text(16, 60, '按空格键或↑键跳跃\n可以连续跳跃2次', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatus();
  }

  update(time, delta) {
    // 水平移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (jumpJustPressed && this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.totalJumps++;
      this.updateStatus();
    }

    // 检测是否在地面上（用于重置跳跃次数）
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.updateStatus();
    }
  }

  updateStatus() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const onGround = this.player && this.player.body.touching.down;
    
    this.statusText.setText(
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}\n` +
      `总跳跃次数: ${this.totalJumps}\n` +
      `状态: ${onGround ? '在地面' : '在空中'}`
    );
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
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

new Phaser.Game(config);