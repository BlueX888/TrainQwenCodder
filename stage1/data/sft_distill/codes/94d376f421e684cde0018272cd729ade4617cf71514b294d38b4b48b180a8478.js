class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证的状态信号
    this.isDashing = false;
    this.canDash = true;
    this.dashSpeed = 80 * 3; // 240
    this.dashDuration = 200; // 冲刺持续时间(毫秒)
    this.dashCooldown = 2000; // 冷却时间(毫秒)
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建冷却指示器（圆环）
    this.cooldownIndicator = this.add.graphics();
    this.cooldownIndicator.setDepth(10);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 更新状态文本
    this.updateStatusText();
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    this.player.setVelocity(velocityX, velocityY);

    // 冲刺持续时间后停止
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0, 0);
      }
    });

    // 冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      }
    });

    // 存储计时器用于绘制冷却指示
    this.cooldownTimer = cooldownTimer;

    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.canDash ? '就绪' : '冷却中';
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n` +
      `状态: ${status}\n` +
      `冲刺速度: ${this.dashSpeed}\n` +
      `冷却时间: ${this.dashCooldown / 1000}秒`
    );
  }

  update(time, delta) {
    // 绘制冷却指示器
    this.cooldownIndicator.clear();

    if (!this.canDash && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      const radius = 20;
      const x = this.player.x;
      const y = this.player.y;

      // 绘制冷却进度圆环
      this.cooldownIndicator.lineStyle(3, 0xff0000, 0.8);
      this.cooldownIndicator.beginPath();
      this.cooldownIndicator.arc(
        x,
        y,
        radius,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * progress),
        false
      );
      this.cooldownIndicator.strokePath();

      // 冷却完成时的提示
      if (progress >= 1) {
        this.cooldownTimer = null;
      }
    }

    // 冲刺状态指示
    if (this.isDashing) {
      // 添加冲刺拖尾效果（使用半透明矩形）
      const trail = this.add.rectangle(
        this.player.x,
        this.player.y,
        32,
        32,
        0x0000ff,
        0.3
      );
      this.time.addEvent({
        delay: 100,
        callback: () => trail.destroy()
      });
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