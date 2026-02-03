class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.totalJumps = 0; // 总跳跃次数（用于验证）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面平台
    this.ground = this.physics.add.sprite(400, 575, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground, () => {
      // 玩家落地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI文本显示状态
    this.jumpText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, '按空格键或上方向键跳跃\n可在空中跳跃一次（双跳）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateUI();
  }

  update(time, delta) {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                       Phaser.Input.Keyboard.JustDown(this.spaceKey);

    if (jumpPressed && this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-360);
      this.jumpCount++;
      this.totalJumps++;
      this.updateUI();

      // 视觉反馈：改变颜色
      if (this.jumpCount === 1) {
        this.player.setTint(0x00ff00); // 第一次跳跃变绿
      } else if (this.jumpCount === 2) {
        this.player.setTint(0xff0000); // 第二次跳跃变红
      }
    }

    // 落地时恢复颜色
    if (this.player.body.touching.down && this.jumpCount > 0) {
      this.jumpCount = 0;
      this.player.clearTint();
      this.updateUI();
    }
  }

  updateUI() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    this.jumpText.setText(
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}\n` +
      `总跳跃次数: ${this.totalJumps}\n` +
      `当前状态: ${this.player.body.touching.down ? '地面' : '空中'}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: DoubleJumpScene
};

new Phaser.Game(config);