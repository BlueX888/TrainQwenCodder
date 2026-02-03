class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 240 * 3; // 720
    this.normalSpeed = 160;
    this.dashDuration = 200; // 冲刺持续时间(毫秒)
    this.dashCooldown = 2500; // 冷却时间(毫秒)
    this.canDash = true;
    this.isDashing = false;
    this.dashCount = 0;
  }

  preload() {
    // 使用Graphics创建青色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xff0000, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 10);
    cooldownGraphics.generateTexture('cooldownBar', 100, 10);
    cooldownGraphics.destroy();
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      dashCount: 0,
      canDash: true,
      isDashing: false,
      cooldownRemaining: 0,
      playerPosition: { x: 0, y: 0 },
      lastDashDirection: null
    };

    // 创建青色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 冷却指示器
    this.cooldownBar = this.add.rectangle(400, 50, 100, 10, 0x00ff00);
    this.cooldownBarBg = this.add.rectangle(400, 50, 100, 10, 0x333333);
    this.cooldownBarBg.setDepth(-1);

    // 状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 冷却计时器引用
    this.cooldownTimer = null;

    this.updateStatusText();
  }

  update(time, delta) {
    // 检测冲刺输入
    if (this.canDash && !this.isDashing) {
      let dashDirection = null;

      if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
        dashDirection = { x: 0, y: -1, name: 'UP' };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
        dashDirection = { x: 0, y: 1, name: 'DOWN' };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
        dashDirection = { x: -1, y: 0, name: 'LEFT' };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
        dashDirection = { x: 1, y: 0, name: 'RIGHT' };
      }

      if (dashDirection) {
        this.performDash(dashDirection);
      }
    }

    // 更新signals
    this.updateSignals();
    this.updateStatusText();
  }

  performDash(direction) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(
      direction.x * this.dashSpeed,
      direction.y * this.dashSpeed
    );

    // 视觉反馈：角色变亮
    this.player.setTint(0xffffff);

    // 冲刺持续时间后恢复
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0, 0);
      this.player.clearTint();
    });

    // 开始冷却
    this.startCooldown();

    // 记录日志
    console.log(JSON.stringify({
      event: 'dash',
      direction: direction.name,
      dashCount: this.dashCount,
      timestamp: Date.now()
    }));

    // 更新signals
    window.__signals__.lastDashDirection = direction.name;
  }

  startCooldown() {
    let cooldownElapsed = 0;

    // 清除之前的冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.remove();
    }

    // 创建冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: () => {
        cooldownElapsed += 50;
        const progress = cooldownElapsed / this.dashCooldown;

        // 更新冷却条
        this.cooldownBar.setScale(1 - progress, 1);

        if (progress >= 1) {
          this.canDash = true;
          this.cooldownBar.setScale(1, 1);
          this.cooldownBar.setFillStyle(0x00ff00);
          this.cooldownTimer.remove();
          this.cooldownTimer = null;

          console.log(JSON.stringify({
            event: 'cooldown_complete',
            dashCount: this.dashCount,
            timestamp: Date.now()
          }));
        } else {
          this.cooldownBar.setFillStyle(0xff0000);
        }
      },
      loop: true
    });
  }

  updateSignals() {
    window.__signals__.dashCount = this.dashCount;
    window.__signals__.canDash = this.canDash;
    window.__signals__.isDashing = this.isDashing;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 计算冷却剩余时间
    if (this.cooldownTimer && !this.canDash) {
      const elapsed = this.cooldownTimer.elapsed;
      window.__signals__.cooldownRemaining = Math.max(0, this.dashCooldown - elapsed);
    } else {
      window.__signals__.cooldownRemaining = 0;
    }
  }

  updateStatusText() {
    const cooldownText = this.canDash ? 'Ready' : `Cooldown: ${(window.__signals__.cooldownRemaining / 1000).toFixed(1)}s`;
    const dashingText = this.isDashing ? 'DASHING!' : '';
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${cooldownText}`,
      dashingText,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      '',
      'Press WASD to dash'
    ]);
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