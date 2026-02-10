class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证状态：冲刺次数
    this.canDash = true; // 冷却状态
    this.isDashing = false; // 是否正在冲刺
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('bluePlayer', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（屏幕中央）
    this.player = this.physics.add.sprite(400, 300, 'bluePlayer');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建冷却指示器（圆形）
    this.cooldownIndicator = this.add.graphics();
    this.cooldownIndicator.setDepth(1);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 键盘控制（可选，用于移动角色）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 冷却计时器（初始为null）
    this.cooldownTimer = null;
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 执行冲刺
    this.performDash(angle);
  }

  performDash(angle) {
    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 冲刺速度：200 * 3 = 600
    const dashSpeed = 600;
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;

    // 设置冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 冲刺持续时间：0.2秒
    this.time.delayedCall(200, () => {
      this.isDashing = false;
      // 冲刺结束后减速
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 开始冷却：2.5秒
    this.startCooldown();
    this.updateStatusText();
  }

  startCooldown() {
    const cooldownDuration = 2500; // 2.5秒

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: cooldownDuration,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
        this.updateStatusText();
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    // 键盘移动控制（非冲刺时）
    if (!this.isDashing) {
      const speed = 200;
      
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      }
    }

    // 更新冷却指示器
    this.updateCooldownIndicator();
  }

  updateStatusText() {
    const cooldownStatus = this.canDash ? '✓ Ready' : '✗ Cooling';
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Cooldown: ${cooldownStatus}`,
      `Click to Dash!`
    ]);
  }

  updateCooldownIndicator() {
    this.cooldownIndicator.clear();

    if (this.cooldownTimer) {
      // 计算冷却进度
      const progress = this.cooldownTimer.getProgress();
      const angle = Phaser.Math.PI2 * progress;

      // 在角色周围绘制冷却进度圆环
      this.cooldownIndicator.lineStyle(4, 0xff0000, 0.8);
      this.cooldownIndicator.beginPath();
      this.cooldownIndicator.arc(
        this.player.x,
        this.player.y,
        25,
        -Math.PI / 2,
        -Math.PI / 2 + angle,
        false
      );
      this.cooldownIndicator.strokePath();
    } else if (this.canDash) {
      // 可以冲刺时显示绿色圆环
      this.cooldownIndicator.lineStyle(3, 0x00ff00, 0.6);
      this.cooldownIndicator.strokeCircle(this.player.x, this.player.y, 25);
    }
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);