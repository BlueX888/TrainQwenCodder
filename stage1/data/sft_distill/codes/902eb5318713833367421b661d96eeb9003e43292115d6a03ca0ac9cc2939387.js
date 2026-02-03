class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCooldown = false; // 冷却状态
    this.isDashing = false; // 冲刺状态
    this.dashCount = 0; // 冲刺次数（可验证状态）
    this.normalSpeed = 160;
    this.dashSpeed = 160 * 3; // 480
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 2000; // 冷却时间2秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.performDash();
    });

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownIndicator = this.add.graphics();
    this.cooldownIndicator.setDepth(10);

    // 说明文本
    this.add.text(10, 550, '方向键移动 | 空格键冲刺（冷却2秒）', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.updateStatusText();
  }

  performDash() {
    // 检查是否在冷却中
    if (this.dashCooldown || this.isDashing) {
      return;
    }

    // 开始冲刺
    this.isDashing = true;
    this.dashCount++;

    // 获取当前移动方向
    let dashVelocityX = 0;
    let dashVelocityY = 0;

    if (this.cursors.left.isDown) {
      dashVelocityX = -this.dashSpeed;
    } else if (this.cursors.right.isDown) {
      dashVelocityX = this.dashSpeed;
    }

    if (this.cursors.up.isDown) {
      dashVelocityY = -this.dashSpeed;
    } else if (this.cursors.down.isDown) {
      dashVelocityY = this.dashSpeed;
    }

    // 如果没有方向输入，默认向右冲刺
    if (dashVelocityX === 0 && dashVelocityY === 0) {
      dashVelocityX = this.dashSpeed;
    }

    // 归一化对角线速度
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      dashVelocityX *= factor;
      dashVelocityY *= factor;
    }

    // 设置冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 视觉反馈：角色变亮
    this.player.setTint(0xffaaaa);

    // 冲刺持续时间结束后恢复
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
      this.startCooldown();
    });

    this.updateStatusText();
  }

  startCooldown() {
    // 进入冷却状态
    this.dashCooldown = true;
    this.cooldownStartTime = this.time.now;

    // 2秒后解除冷却
    this.time.delayedCall(this.cooldownTime, () => {
      this.dashCooldown = false;
      this.updateStatusText();
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 正常移动控制（非冲刺状态）
    if (!this.isDashing) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -this.normalSpeed;
      } else if (this.cursors.right.isDown) {
        velocityX = this.normalSpeed;
      }

      if (this.cursors.up.isDown) {
        velocityY = -this.normalSpeed;
      } else if (this.cursors.down.isDown) {
        velocityY = this.normalSpeed;
      }

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新状态文本
    this.updateStatusText();

    // 绘制冷却指示器
    this.drawCooldownIndicator();
  }

  updateStatusText() {
    const status = this.isDashing ? '冲刺中!' : 
                   this.dashCooldown ? '冷却中...' : '准备就绪';
    this.statusText.setText(
      `状态: ${status}\n` +
      `冲刺次数: ${this.dashCount}\n` +
      `速度: ${Math.round(this.player.body.velocity.length())}`
    );
  }

  drawCooldownIndicator() {
    this.cooldownIndicator.clear();

    if (this.dashCooldown) {
      // 计算冷却进度
      const elapsed = this.time.now - this.cooldownStartTime;
      const progress = Math.min(elapsed / this.cooldownTime, 1);

      // 绘制冷却条
      const barWidth = 200;
      const barHeight = 20;
      const barX = 10;
      const barY = 80;

      // 背景
      this.cooldownIndicator.fillStyle(0x333333, 0.8);
      this.cooldownIndicator.fillRect(barX, barY, barWidth, barHeight);

      // 进度条
      this.cooldownIndicator.fillStyle(0x00ff00, 0.8);
      this.cooldownIndicator.fillRect(barX, barY, barWidth * progress, barHeight);

      // 边框
      this.cooldownIndicator.lineStyle(2, 0xffffff, 1);
      this.cooldownIndicator.strokeRect(barX, barY, barWidth, barHeight);
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