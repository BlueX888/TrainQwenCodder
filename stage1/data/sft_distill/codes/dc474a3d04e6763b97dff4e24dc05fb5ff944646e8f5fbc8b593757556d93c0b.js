class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    
    // 状态变量（用于验证）
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建黄色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFF00, 1); // 黄色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.baseSpeed = 240;
    this.dashSpeed = this.baseSpeed * 3; // 720
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冷却时间（毫秒）

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下
    this.spaceKey.on('down', () => {
      this.attemptDash();
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却进度条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(10, 50, 200, 20);

    // 创建冷却进度条
    this.cooldownBar = this.add.graphics();

    // 添加说明文本
    this.add.text(10, height - 80, 'Controls:', {
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.add.text(10, height - 60, 'Arrow Keys: Move', {
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.add.text(10, height - 40, 'Space: Dash (Cooldown: 2.5s)', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    // 冷却计时器引用
    this.cooldownTimer = null;
    this.dashTimer = null;
  }

  update(time, delta) {
    // 基础移动（如果不在冲刺中）
    if (!this.isDashing) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.baseSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.baseSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.baseSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.baseSpeed);
      }
    }

    // 更新状态文本
    this.updateStatusText();

    // 更新冷却进度条
    this.updateCooldownBar();
  }

  attemptDash() {
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 获取当前移动方向
    let dashX = 0;
    let dashY = 0;

    if (this.cursors.left.isDown) {
      dashX = -1;
    } else if (this.cursors.right.isDown) {
      dashX = 1;
    }

    if (this.cursors.up.isDown) {
      dashY = -1;
    } else if (this.cursors.down.isDown) {
      dashY = 1;
    }

    // 如果没有方向输入，默认向右冲刺
    if (dashX === 0 && dashY === 0) {
      dashX = 1;
    }

    // 归一化方向向量
    const length = Math.sqrt(dashX * dashX + dashY * dashY);
    if (length > 0) {
      dashX /= length;
      dashY /= length;
    }

    // 执行冲刺
    this.executeDash(dashX, dashY);
  }

  executeDash(dirX, dirY) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);

    // 改变颜色表示冲刺状态
    this.player.setTint(0xFF8800);

    // 冲刺持续时间计时器
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        this.player.setVelocity(0);
      },
      callbackScope: this
    });

    // 冷却计时器
    this.cooldownRemaining = this.dashCooldown;
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
      },
      callbackScope: this
    });
  }

  updateStatusText() {
    const status = [
      `Dash Count: ${this.dashCount}`,
      `Dashing: ${this.isDashing ? 'YES' : 'NO'}`,
      `Can Dash: ${this.canDash ? 'READY' : 'COOLDOWN'}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ];
    this.statusText.setText(status.join('\n'));
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (!this.canDash && this.cooldownTimer) {
      // 计算冷却进度
      const elapsed = this.cooldownTimer.getElapsed();
      const progress = Math.min(elapsed / this.dashCooldown, 1);
      this.cooldownRemaining = Math.max(0, this.dashCooldown - elapsed);

      // 绘制进度条（从红到绿）
      const color = progress < 1 ? 0xFF0000 : 0x00FF00;
      this.cooldownBar.fillStyle(color, 1);
      this.cooldownBar.fillRect(10, 50, 200 * progress, 20);
    } else {
      // 冷却完成，显示绿色
      this.cooldownBar.fillStyle(0x00FF00, 1);
      this.cooldownBar.fillRect(10, 50, 200, 20);
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
  scene: DashGameScene
};

new Phaser.Game(config);