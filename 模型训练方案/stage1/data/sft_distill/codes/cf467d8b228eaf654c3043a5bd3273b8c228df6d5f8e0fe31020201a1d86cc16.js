class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号
    this.canDash = true; // 冲刺冷却状态
    this.dashSpeed = 80 * 3; // 冲刺速度 = 240
    this.dashCooldown = 1500; // 冷却时间1.5秒
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建白色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理精灵角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加阻力使冲刺后逐渐减速

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 添加冷却提示圆圈
    this.cooldownCircle = this.add.graphics();
    this.cooldownProgress = 0;

    // 更新状态显示
    this.updateStatus();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash) {
      return;
    }

    // 计算从角色到鼠标的方向向量
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 归一化方向向量并乘以冲刺速度
    if (distance > 0) {
      const velocityX = (dx / distance) * this.dashSpeed;
      const velocityY = (dy / distance) * this.dashSpeed;

      // 设置角色速度进行冲刺
      this.player.setVelocity(velocityX, velocityY);

      // 增加冲刺计数
      this.dashCount++;

      // 进入冷却状态
      this.canDash = false;
      this.cooldownProgress = 0;

      // 设置冷却计时器
      this.time.addEvent({
        delay: this.dashCooldown,
        callback: () => {
          this.canDash = true;
          this.cooldownProgress = 1;
          this.updateStatus();
        },
        callbackScope: this
      });

      // 更新状态显示
      this.updateStatus();
    }
  }

  update(time, delta) {
    // 更新冷却进度
    if (!this.canDash && this.cooldownProgress < 1) {
      this.cooldownProgress += delta / this.dashCooldown;
      this.cooldownProgress = Math.min(this.cooldownProgress, 1);
    }

    // 绘制冷却指示器
    this.drawCooldownIndicator();

    // 更新状态文本
    this.updateStatus();
  }

  updateStatus() {
    const cooldownStatus = this.canDash ? 'Ready' : 'Cooling...';
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Cooldown: ${cooldownStatus}`,
      `Speed: ${this.player.body.speed.toFixed(0)}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Click mouse to dash!'
    ]);
  }

  drawCooldownIndicator() {
    this.cooldownCircle.clear();

    // 在角色周围绘制冷却进度圆圈
    if (!this.canDash) {
      const radius = 20;
      const angle = Phaser.Math.PI2 * this.cooldownProgress;

      this.cooldownCircle.lineStyle(3, 0x00ff00, 1);
      this.cooldownCircle.beginPath();
      this.cooldownCircle.arc(
        this.player.x,
        this.player.y,
        radius,
        Phaser.Math.DegToRad(270),
        Phaser.Math.DegToRad(270) + angle,
        false
      );
      this.cooldownCircle.strokePath();
    } else {
      // 冷却完成，绘制完整圆圈
      this.cooldownCircle.lineStyle(2, 0x00ff00, 0.5);
      this.cooldownCircle.strokeCircle(this.player.x, this.player.y, 20);
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
  scene: DashScene
};

new Phaser.Game(config);