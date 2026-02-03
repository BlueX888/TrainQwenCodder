class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashReady = true; // 状态信号：冲刺是否就绪
    this.dashCooldown = 0; // 状态信号：冷却剩余时间
    this.normalSpeed = 120;
    this.dashSpeed = 360; // 120 * 3
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 3000; // 冷却时间（毫秒）
  }

  preload() {
    // 使用 Graphics 创建粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0x888888, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 20);
    cooldownGraphics.generateTexture('cooldownBg', 100, 20);
    cooldownGraphics.destroy();
  }

  create() {
    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却进度条背景
    this.cooldownBg = this.add.rectangle(400, 50, 100, 20, 0x333333);
    this.cooldownBar = this.add.rectangle(400, 50, 100, 20, 0xff69b4);
    this.cooldownBar.setOrigin(0.5, 0.5);

    // 冷却计时器（初始为 null）
    this.cooldownTimer = null;

    // 冲刺状态
    this.isDashing = false;

    this.updateStatusText();
  }

  update(time, delta) {
    // 正常移动控制
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

    // 检测空格键冲刺
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.dashReady && !this.isDashing) {
      this.performDash();
    }

    // 更新冷却显示
    this.updateCooldownDisplay();
    this.updateStatusText();
  }

  performDash() {
    this.isDashing = true;
    this.dashReady = false;

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

    // 应用冲刺速度
    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 冲刺视觉效果（改变颜色）
    this.player.setTint(0xffffff);

    // 冲刺持续时间结束
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.setVelocity(0);
      this.player.clearTint();
    });

    // 开始冷却
    this.startCooldown();
  }

  startCooldown() {
    this.dashCooldown = this.cooldownTime;

    // 移除旧的冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    // 创建新的冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.dashReady = true;
        this.dashCooldown = 0;
        this.cooldownTimer = null;
      },
      callbackScope: this
    });
  }

  updateCooldownDisplay() {
    if (this.cooldownTimer) {
      const elapsed = this.cooldownTimer.getElapsed();
      const remaining = this.cooldownTime - elapsed;
      this.dashCooldown = Math.max(0, remaining);

      // 更新进度条
      const progress = 1 - (remaining / this.cooldownTime);
      this.cooldownBar.setScale(progress, 1);
      this.cooldownBar.setFillStyle(progress >= 1 ? 0xff69b4 : 0xff0000);
    } else {
      this.cooldownBar.setScale(1, 1);
      this.cooldownBar.setFillStyle(0xff69b4);
    }
  }

  updateStatusText() {
    const cooldownSec = (this.dashCooldown / 1000).toFixed(1);
    const status = this.dashReady ? 'READY' : `COOLDOWN: ${cooldownSec}s`;
    
    this.statusText.setText([
      `Dash Status: ${status}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Speed: ${this.isDashing ? 'DASHING (360)' : 'Normal (120)'}`,
      '',
      'Controls:',
      'Arrow Keys - Move',
      'Space - Dash'
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