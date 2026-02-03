class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.isDashOnCooldown = false; // 状态信号：冷却状态
    this.cooldownRemaining = 0; // 状态信号：剩余冷却时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建黄色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800); // 添加阻力，让冲刺后逐渐减速

    // 冲刺参数
    this.dashSpeed = 360 * 3; // 1080
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 冷却时间（毫秒）

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    // 更新状态显示
    this.updateStatusText();
  }

  performDash(pointer) {
    // 检查是否在冷却中
    if (this.isDashOnCooldown) {
      console.log('Dash on cooldown!');
      return;
    }

    // 计算从角色到鼠标位置的方向向量
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 归一化方向向量
    if (distance > 0) {
      const dirX = dx / distance;
      const dirY = dy / distance;

      // 应用冲刺速度
      this.player.setVelocity(
        dirX * this.dashSpeed,
        dirY * this.dashSpeed
      );

      // 增加冲刺计数
      this.dashCount++;

      // 启动冷却
      this.startCooldown();

      // 短暂时间后恢复正常速度（可选，让冲刺更有冲击感）
      this.time.delayedCall(this.dashDuration, () => {
        // 冲刺结束后减速
        this.player.setVelocity(
          this.player.body.velocity.x * 0.3,
          this.player.body.velocity.y * 0.3
        );
      });

      console.log(`Dash performed! Count: ${this.dashCount}`);
    }
  }

  startCooldown() {
    this.isDashOnCooldown = true;
    this.cooldownRemaining = this.dashCooldown;

    // 创建冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.isDashOnCooldown = false;
        this.cooldownRemaining = 0;
        console.log('Dash ready!');
      }
    });
  }

  update(time, delta) {
    // 更新冷却剩余时间
    if (this.isDashOnCooldown) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    }

    // 更新状态显示
    this.updateStatusText();
    this.updateCooldownBar();
  }

  updateStatusText() {
    const cooldownText = this.isDashOnCooldown 
      ? `Cooldown: ${(this.cooldownRemaining / 1000).toFixed(1)}s`
      : 'Ready!';
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${cooldownText}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Velocity: (${Math.floor(this.player.body.velocity.x)}, ${Math.floor(this.player.body.velocity.y)})`,
      '',
      'Click left mouse button to dash!'
    ]);
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (this.isDashOnCooldown) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 10;
      const barY = 140;

      // 背景
      this.cooldownBar.fillStyle(0x333333, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

      // 冷却进度
      const progress = 1 - (this.cooldownRemaining / this.dashCooldown);
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);

      // 边框
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