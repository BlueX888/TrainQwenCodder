class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 240 * 3; // 720
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（毫秒）
    this.canDash = true; // 可验证状态：是否可以冲刺
    this.dashCount = 0; // 可验证状态：冲刺次数
    this.cooldownRemaining = 0; // 可验证状态：剩余冷却时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵（启用物理系统）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力使冲刺后自然减速

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();
    
    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建提示文本
    this.add.text(400, 550, '点击鼠标左键进行冲刺', {
      fontSize: '18px',
      fill: '#00ffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 冷却计时器引用
    this.cooldownTimer = null;

    // 更新状态显示
    this.updateStatusText();
  }

  attemptDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 设置冲刺速度
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    this.player.setVelocity(velocityX, velocityY);

    // 增加冲刺计数
    this.dashCount++;

    // 进入冷却状态
    this.canDash = false;
    this.cooldownRemaining = this.dashCooldown;

    // 冲刺结束后减速
    this.time.delayedCall(this.dashDuration, () => {
      const currentVelX = this.player.body.velocity.x;
      const currentVelY = this.player.body.velocity.y;
      this.player.setVelocity(currentVelX * 0.3, currentVelY * 0.3);
    });

    // 启动冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新冷却剩余时间
    if (!this.canDash && this.cooldownTimer) {
      this.cooldownRemaining = Math.max(0, this.cooldownTimer.getRemaining());
      this.updateStatusText();
      this.drawCooldownBar();
    }
  }

  updateStatusText() {
    const status = this.canDash ? '准备就绪' : '冷却中';
    const cooldownText = this.canDash ? '' : ` (${(this.cooldownRemaining / 1000).toFixed(1)}s)`;
    
    this.statusText.setText([
      `冲刺状态: ${status}${cooldownText}`,
      `冲刺次数: ${this.dashCount}`,
      `冲刺速度: ${this.dashSpeed}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  drawCooldownBar() {
    this.cooldownBar.clear();
    
    if (!this.canDash) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 10;
      const barY = 100;
      
      // 绘制背景
      this.cooldownBar.fillStyle(0x333333, 0.8);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);
      
      // 绘制进度
      const progress = 1 - (this.cooldownRemaining / this.dashCooldown);
      this.cooldownBar.fillStyle(0x00ffff, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // 绘制边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
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