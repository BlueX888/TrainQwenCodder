class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.canDash = true; // 状态信号：是否可以冲刺
    this.isDashing = false; // 当前是否正在冲刺
    this.normalSpeed = 120; // 正常移动速度
    this.dashSpeed = 360; // 冲刺速度 (120 * 3)
    this.dashDuration = 300; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 冷却时间（毫秒）
  }

  preload() {
    // 使用 Graphics 创建粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0x888888, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 20);
    cooldownGraphics.generateTexture('cooldownBg', 100, 20);
    cooldownGraphics.destroy();

    const cooldownFillGraphics = this.add.graphics();
    cooldownFillGraphics.fillStyle(0x00ff00, 1);
    cooldownFillGraphics.fillRect(0, 0, 100, 20);
    cooldownFillGraphics.generateTexture('cooldownFill', 100, 20);
    cooldownFillGraphics.destroy();
  }

  create() {
    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.performDash();
    });

    // 创建UI文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBg = this.add.image(16, 60, 'cooldownBg').setOrigin(0, 0);
    this.cooldownFill = this.add.image(16, 60, 'cooldownFill').setOrigin(0, 0);
    this.cooldownFill.setDisplaySize(100, 20);

    // 添加说明文本
    this.add.text(16, 90, '方向键移动 | 空格键冲刺', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 如果不在冲刺状态，响应方向键移动
    if (!this.isDashing) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.normalSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.normalSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.normalSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.normalSpeed);
      }
    }
  }

  performDash() {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 确定冲刺方向
    let dashDirection = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown) {
      dashDirection.x = -1;
    } else if (this.cursors.right.isDown) {
      dashDirection.x = 1;
    }

    if (this.cursors.up.isDown) {
      dashDirection.y = -1;
    } else if (this.cursors.down.isDown) {
      dashDirection.y = 1;
    }

    // 如果没有方向键按下，默认向右冲刺
    if (dashDirection.x === 0 && dashDirection.y === 0) {
      dashDirection.x = 1;
    }

    // 归一化方向向量
    dashDirection.normalize();

    // 执行冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(
      dashDirection.x * this.dashSpeed,
      dashDirection.y * this.dashSpeed
    );

    // 冲刺持续时间后恢复正常
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0);
    });

    // 冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const cooldownStatus = this.canDash ? '就绪' : '冷却中';
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n` +
      `状态: ${cooldownStatus}`
    );

    // 更新冷却指示器
    if (this.canDash) {
      this.cooldownFill.setDisplaySize(100, 20);
    }
  }
}

// 扩展场景以更新冷却进度条
DashScene.prototype.preUpdate = function(time, delta) {
  // 更新冷却进度条
  if (!this.canDash && this.cooldownTimer) {
    const progress = this.cooldownTimer.getProgress();
    const fillWidth = 100 * progress;
    this.cooldownFill.setDisplaySize(fillWidth, 20);
  }
};

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