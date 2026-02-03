class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.isDashing = false;
    this.dashCooldown = 0; // 冷却剩余时间（秒）
    this.dashCount = 0; // 冲刺次数统计
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建白色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建角色精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.normalSpeed = 200;
    this.dashSpeed = 200 * 3; // 600
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldownTime = 3000; // 冷却时间（毫秒）

    // 冷却状态
    this.canDash = true;
    this.cooldownTimer = null;

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 空格键按下事件
    this.spaceKey.on('down', () => {
      this.performDash();
    });

    // 状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(width / 2, 30, '方向键移动 | 空格键冲刺', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 更新状态显示
    this.updateStatusText();
  }

  performDash() {
    // 检查是否可以冲刺
    if (!this.canDash) {
      return;
    }

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

    // 如果没有按方向键，默认向右冲刺
    if (dashVelocityX === 0 && dashVelocityY === 0) {
      dashVelocityX = this.dashSpeed;
    }

    // 对角线移动时标准化速度
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      dashVelocityX *= factor;
      dashVelocityY *= factor;
    }

    // 执行冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 冲刺视觉效果：改变透明度
    this.player.setAlpha(0.7);

    // 冲刺持续时间结束后恢复
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setAlpha(1);
      // 恢复正常移动控制
    });

    // 开始冷却
    this.dashCooldown = this.dashCooldownTime / 1000;
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldownTime,
      callback: () => {
        this.canDash = true;
        this.dashCooldown = 0;
        this.updateStatusText();
      }
    });
  }

  update(time, delta) {
    // 更新冷却倒计时显示
    if (!this.canDash && this.cooldownTimer) {
      this.dashCooldown = Math.max(0, this.cooldownTimer.getRemaining() / 1000);
      this.updateStatusText();
    }

    // 非冲刺状态下的正常移动
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

      // 对角线移动时标准化速度
      if (velocityX !== 0 && velocityY !== 0) {
        const factor = Math.sqrt(2) / 2;
        velocityX *= factor;
        velocityY *= factor;
      }

      this.player.setVelocity(velocityX, velocityY);
    }
  }

  updateStatusText() {
    const cooldownText = this.canDash ? '就绪' : `冷却中: ${this.dashCooldown.toFixed(1)}s`;
    const dashingText = this.isDashing ? '冲刺中!' : '正常';
    
    this.statusText.setText([
      `状态: ${dashingText}`,
      `冲刺: ${cooldownText}`,
      `冲刺次数: ${this.dashCount}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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
  scene: GameScene
};

new Phaser.Game(config);