class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 240 * 3; // 冲刺速度
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冷却时间（毫秒）
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
    this.dashCount = 0; // 冲刺次数（验证变量）
    this.cooldownRemaining = 0; // 剩余冷却时间（验证变量）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建角色精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建冷却指示器背景
    this.cooldownBg = this.add.graphics();
    this.cooldownBg.fillStyle(0x333333, 0.8);
    this.cooldownBg.fillRect(10, 10, 200, 30);

    // 创建冷却指示器前景
    this.cooldownBar = this.add.graphics();

    // 创建状态文本
    this.statusText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(10, 550, '点击鼠标左键进行冲刺', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#9b59b6',
      padding: { x: 10, y: 5 }
    });

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

    // 执行冲刺
    this.executeDash(angle);
  }

  executeDash(angle) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 计算冲刺速度分量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 设置冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 冲刺持续时间结束后恢复正常
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        // 减速但不完全停止
        this.player.setVelocity(
          this.player.body.velocity.x * 0.3,
          this.player.body.velocity.y * 0.3
        );
      }
    });

    // 开始冷却
    this.cooldownRemaining = this.dashCooldown;
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.updateStatus();
      }
    });

    this.updateStatus();
  }

  update(time, delta) {
    // 更新冷却时间
    if (!this.canDash && this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
      this.updateCooldownBar();
    }

    // 更新状态文本
    this.updateStatus();
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (!this.canDash) {
      // 计算冷却进度
      const progress = 1 - (this.cooldownRemaining / this.dashCooldown);
      const barWidth = 200 * progress;

      // 绘制进度条
      this.cooldownBar.fillStyle(0x9b59b6, 1);
      this.cooldownBar.fillRect(10, 10, barWidth, 30);
    } else {
      // 冷却完成，显示绿色
      this.cooldownBar.fillStyle(0x27ae60, 1);
      this.cooldownBar.fillRect(10, 10, 200, 30);
    }
  }

  updateStatus() {
    const status = this.canDash ? '就绪' : '冷却中';
    const cooldownText = this.canDash ? '' : ` (${(this.cooldownRemaining / 1000).toFixed(1)}s)`;
    
    this.statusText.setText([
      `冲刺状态: ${status}${cooldownText}`,
      `冲刺次数: ${this.dashCount}`,
      `正在冲刺: ${this.isDashing ? '是' : '否'}`,
      `速度: ${Math.round(this.player.body.velocity.length())}`
    ]);

    this.updateCooldownBar();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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