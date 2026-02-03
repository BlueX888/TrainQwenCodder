class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已使用的跳跃次数
    this.totalJumps = 0; // 总跳跃计数（状态信号）
    this.maxJumps = 2; // 最大跳跃次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（使用Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, width, 60);
    groundGraphics.generateTexture('ground', width, 60);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height - 200, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticSprite(width / 2, height - 30, 'ground');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 触地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.jumpText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, '按空格键或上箭头跳跃\n可以双跳！', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新状态显示
    this.updateStatusText();
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

    // 双跳逻辑
    const jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                           Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (jumpJustPressed && this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-160);
      this.jumpCount++;
      this.totalJumps++;
      
      // 更新状态显示
      this.updateStatusText();
      
      // 视觉反馈：第二次跳跃时改变颜色
      if (this.jumpCount === 2) {
        this.player.setTint(0xffff00);
      } else {
        this.player.clearTint();
      }
    }

    // 检测是否触地（用于重置跳跃次数）
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.player.clearTint();
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    this.jumpText.setText(
      `可用跳跃: ${remainingJumps}/${this.maxJumps}\n` +
      `总跳跃次数: ${this.totalJumps}`
    );
  }
}

// 游戏配置
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);