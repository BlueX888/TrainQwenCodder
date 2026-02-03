class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已使用的跳跃次数
    this.totalJumps = 0; // 总跳跃统计（可验证状态）
    this.maxJumps = 2; // 最大跳跃次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 60);
    groundGraphics.generateTexture('ground', 800, 60);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 48);

    // 创建地面平台
    this.ground = this.physics.add.staticSprite(400, 570, 'ground');
    this.ground.refreshBody();

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 当玩家接触地面时，重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件（使用 justDown 避免长按连续触发）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.handleJump();
    });

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(16, 60, 
      'Press SPACE to jump (Double Jump Available)\nArrow Keys to move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 跳跃提示文本
    this.jumpIndicator = this.add.text(400, 100, '', {
      fontSize: '24px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  handleJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-200);
      this.jumpCount++;
      this.totalJumps++;

      // 显示跳跃提示
      const jumpText = this.jumpCount === 1 ? 'First Jump!' : 'Double Jump!';
      this.jumpIndicator.setText(jumpText);
      this.jumpIndicator.setAlpha(1);

      // 淡出动画
      this.tweens.add({
        targets: this.jumpIndicator,
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    this.statusText.setText(
      `Remaining Jumps: ${remainingJumps}/${this.maxJumps}\n` +
      `Total Jumps: ${this.totalJumps}`
    );
  }

  update(time, delta) {
    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 检测是否在地面上（用于重置跳跃次数）
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.updateStatusText();
    }

    // 更新玩家颜色以指示跳跃状态
    if (this.jumpCount === 0) {
      this.player.setTint(0x00ff00); // 绿色：可以双跳
    } else if (this.jumpCount === 1) {
      this.player.setTint(0xffff00); // 黄色：还可以跳一次
    } else {
      this.player.setTint(0xff0000); // 红色：无法再跳
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
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);