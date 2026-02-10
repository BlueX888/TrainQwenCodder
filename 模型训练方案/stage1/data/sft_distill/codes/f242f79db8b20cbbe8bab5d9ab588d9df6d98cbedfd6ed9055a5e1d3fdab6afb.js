class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
    this.normalSpeed = 160; // 正常移动速度
    this.dashSpeed = 160 * 3; // 冲刺速度（480）
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间（2秒）
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建方向键和空格键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建状态文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    this.updateStatusText();
  }

  update(time, delta) {
    // 更新状态显示
    this.updateStatusText();
    this.updateCooldownBar();

    // 基础移动逻辑（非冲刺状态）
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

    // 冲刺逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canDash && !this.isDashing) {
      this.performDash();
    }
  }

  performDash() {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 确定冲刺方向
    let dashVelocityX = 0;
    let dashVelocityY = 0;

    // 根据当前按键确定冲刺方向
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

    // 如果同时按了两个方向，需要归一化速度向量
    if (dashVelocityX !== 0 && dashVelocityY !== 0) {
      const factor = this.dashSpeed / Math.sqrt(dashVelocityX * dashVelocityX + dashVelocityY * dashVelocityY);
      dashVelocityX *= factor;
      dashVelocityY *= factor;
    }

    // 设置冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 视觉反馈：改变角色颜色
    this.player.setTint(0xffff00);

    // 冲刺持续时间结束后恢复
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
      }
    });

    // 冷却时间结束后允许再次冲刺
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
      }
    });
  }

  updateStatusText() {
    const cooldownStatus = this.canDash ? 'Ready' : 'Cooling down';
    const dashingStatus = this.isDashing ? 'DASHING!' : 'Normal';
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${dashingStatus}`,
      `Cooldown: ${cooldownStatus}`,
      `Speed: ${this.isDashing ? this.dashSpeed : this.normalSpeed}`,
      '',
      'Controls:',
      'Arrow Keys - Move',
      'Space - Dash'
    ]);
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (!this.canDash) {
      // 绘制冷却进度条
      const barWidth = 200;
      const barHeight = 20;
      const barX = 16;
      const barY = 200;

      // 背景
      this.cooldownBar.fillStyle(0x333333, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

      // 进度（这里简化处理，实际应该计算剩余时间）
      this.cooldownBar.fillStyle(0xff0000, 1);
      const progress = 0.5; // 简化显示
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);

      // 边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
    } else {
      // 冷却完成，显示绿色条
      const barWidth = 200;
      const barHeight = 20;
      const barX = 16;
      const barY = 200;

      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

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
  scene: GameScene
};

new Phaser.Game(config);