class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    this.player = null;
    this.isDashing = false;
    this.canDash = true;
    this.dashCooldown = 3000; // 3秒冷却
    this.dashSpeed = 300 * 3; // 冲刺速度
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.normalSpeed = 200; // 正常移动速度
    this.cooldownRemaining = 0; // 剩余冷却时间（用于验证）
  }

  preload() {
    // 使用Graphics创建粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.cooldownText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 键盘移动控制（WASD）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加提示文本
    this.add.text(400, 550, '使用WASD移动，鼠标右键冲刺', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;

    // 应用冲刺速度
    this.player.setVelocity(
      Math.cos(angle) * this.dashSpeed,
      Math.sin(angle) * this.dashSpeed
    );

    // 改变角色颜色表示冲刺状态
    this.player.setTint(0xffffff);

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0, 0);
        this.player.clearTint();
      }
    });

    // 冷却时间
    this.cooldownRemaining = this.dashCooldown;
    const cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
      }
    });

    // 更新冷却倒计时
    this.time.addEvent({
      delay: 100,
      repeat: Math.ceil(this.dashCooldown / 100),
      callback: () => {
        this.cooldownRemaining = Math.max(0, cooldownTimer.getRemaining());
      }
    });
  }

  update(time, delta) {
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

      // 归一化对角线移动速度
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新状态显示
    const status = this.isDashing ? '冲刺中!' : (this.canDash ? '就绪' : '冷却中');
    this.statusText.setText(`状态: ${status}`);

    if (!this.canDash && this.cooldownRemaining > 0) {
      this.cooldownText.setText(`冷却: ${(this.cooldownRemaining / 1000).toFixed(1)}秒`);
      this.cooldownText.setVisible(true);
    } else {
      this.cooldownText.setVisible(false);
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