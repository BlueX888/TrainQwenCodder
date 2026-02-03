class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.isDashing = false;
    this.dashCooldown = false;
    this.dashSpeed = 600; // 200 * 3
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 1000; // 冷却时间1秒
    this.dashCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTexture', 40, 40);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 0.8);
    this.cooldownBarBg.fillRect(10, 50, 200, 20);

    // 创建冷却条
    this.cooldownBar = this.add.graphics();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 更新状态显示
    this.updateStatus();
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (this.isDashing || this.dashCooldown) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 计算速度向量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 开始冲刺
    this.startDash(velocityX, velocityY);
  }

  startDash(velocityX, velocityY) {
    this.isDashing = true;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 视觉反馈：角色变亮
    this.player.setTint(0xffffff);

    // 冲刺持续时间
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.endDash();
      }
    });

    this.updateStatus();
  }

  endDash() {
    this.isDashing = false;

    // 停止角色移动
    this.player.setVelocity(0, 0);

    // 恢复角色颜色
    this.player.clearTint();

    // 开始冷却
    this.startCooldown();

    this.updateStatus();
  }

  startCooldown() {
    this.dashCooldown = true;
    this.cooldownStartTime = this.time.now;

    // 冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.dashCooldown = false;
        this.updateStatus();
      }
    });
  }

  updateStatus() {
    let status = `Dash Count: ${this.dashCount}\n`;
    
    if (this.isDashing) {
      status += 'Status: DASHING!';
    } else if (this.dashCooldown) {
      status += 'Status: Cooldown...';
    } else {
      status += 'Status: Ready (Click to Dash)';
    }

    this.statusText.setText(status);
  }

  update(time, delta) {
    // 更新冷却条显示
    this.cooldownBar.clear();

    if (this.dashCooldown && this.cooldownTimer) {
      const elapsed = time - this.cooldownStartTime;
      const progress = Math.min(elapsed / this.cooldownTime, 1);
      const barWidth = 200 * (1 - progress);

      // 冷却中显示红色，冷却完成显示绿色
      if (progress < 1) {
        this.cooldownBar.fillStyle(0xff0000, 0.8);
        this.cooldownBar.fillRect(10, 50, barWidth, 20);
      } else {
        this.cooldownBar.fillStyle(0x00ff00, 0.8);
        this.cooldownBar.fillRect(10, 50, 200, 20);
      }
    } else if (!this.dashCooldown) {
      // 准备就绪显示绿色
      this.cooldownBar.fillStyle(0x00ff00, 0.8);
      this.cooldownBar.fillRect(10, 50, 200, 20);
    }

    // 实时更新状态文本
    if (this.dashCooldown) {
      this.updateStatus();
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