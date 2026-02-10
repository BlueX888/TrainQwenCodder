class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.canDash = true; // 状态信号：是否可以冲刺
    this.isDashing = false; // 当前是否正在冲刺
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9966ff, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownIndicator = this.add.graphics();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 键盘控制（WASD）
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.updateStatusText();
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

    // 冲刺速度：300 * 3 = 900
    const dashSpeed = 900;
    const dashVelocityX = Math.cos(angle) * dashSpeed;
    const dashVelocityY = Math.sin(angle) * dashSpeed;

    // 应用冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 冲刺视觉效果：角色变亮
    this.player.setTint(0xffffff);

    // 冲刺持续时间 0.2 秒
    this.time.addEvent({
      delay: 200,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        // 冲刺结束后减速
        this.player.setVelocity(
          this.player.body.velocity.x * 0.3,
          this.player.body.velocity.y * 0.3
        );
      }
    });

    // 冷却时间 2.5 秒
    this.cooldownTimer = this.time.addEvent({
      delay: 2500,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const cooldownStatus = this.canDash ? '✓ Ready' : '✗ Cooling down';
    this.statusText.setText(
      `Dash Count: ${this.dashCount}\n` +
      `Dash Status: ${cooldownStatus}\n` +
      `Click left mouse to dash\n` +
      `WASD to move`
    );
  }

  update(time, delta) {
    // 键盘移动控制（正常速度 300）
    if (!this.isDashing) {
      const normalSpeed = 300;
      let velocityX = 0;
      let velocityY = 0;

      if (this.keys.A.isDown) {
        velocityX = -normalSpeed;
      } else if (this.keys.D.isDown) {
        velocityX = normalSpeed;
      }

      if (this.keys.W.isDown) {
        velocityY = -normalSpeed;
      } else if (this.keys.S.isDown) {
        velocityY = normalSpeed;
      }

      // 只在不冲刺时应用键盘控制
      if (velocityX !== 0 || velocityY !== 0) {
        this.player.setVelocity(velocityX, velocityY);
      }
    }

    // 绘制冷却指示器
    this.cooldownIndicator.clear();
    if (!this.canDash && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      const barWidth = 200;
      const barHeight = 20;
      const barX = 10;
      const barY = 100;

      // 背景
      this.cooldownIndicator.fillStyle(0x333333, 1);
      this.cooldownIndicator.fillRect(barX, barY, barWidth, barHeight);

      // 进度条
      this.cooldownIndicator.fillStyle(0x9966ff, 1);
      this.cooldownIndicator.fillRect(
        barX,
        barY,
        barWidth * progress,
        barHeight
      );

      // 边框
      this.cooldownIndicator.lineStyle(2, 0xffffff, 1);
      this.cooldownIndicator.strokeRect(barX, barY, barWidth, barHeight);

      // 冷却剩余时间文本
      const remaining = (this.cooldownTimer.getRemaining() / 1000).toFixed(1);
      if (!this.cooldownText) {
        this.cooldownText = this.add.text(barX + barWidth + 10, barY, '', {
          fontSize: '16px',
          fill: '#ffffff'
        });
      }
      this.cooldownText.setText(`${remaining}s`);
    } else if (this.cooldownText) {
      this.cooldownText.setText('');
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