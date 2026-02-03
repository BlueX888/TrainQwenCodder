class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.isDashing = false;
    this.canDash = true;
    this.dashCooldown = 2500; // 2.5秒冷却
    this.dashSpeed = 900; // 300 * 3
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.normalSpeed = 200;
    
    // 可验证状态变量
    this.dashCount = 0; // 冲刺次数
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 创建紫色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9400D3, 1); // 深紫色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xFFFFFF, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 10);
    cooldownGraphics.generateTexture('cooldownBar', 100, 10);
    cooldownGraphics.destroy();
  }

  create() {
    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建方向指示文本
    this.directionText = this.add.text(10, 10, 'WASD移动 | 右键冲刺', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 创建状态显示文本
    this.statusText = this.add.text(10, 35, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    // 创建冷却条背景
    this.cooldownBarBg = this.add.rectangle(400, 550, 100, 10, 0x333333);
    
    // 创建冷却条
    this.cooldownBar = this.add.rectangle(400, 550, 100, 10, 0xff0000);
    this.cooldownBar.setOrigin(0.5, 0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 冷却计时器引用
    this.cooldownTimer = null;
    this.dashTimer = null;

    this.updateStatusText();
  }

  update(time, delta) {
    if (!this.isDashing) {
      // 正常移动
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

    // 更新冷却显示
    if (!this.canDash && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      this.cooldownRemaining = Math.ceil(this.cooldownTimer.getRemaining());
      this.cooldownBar.scaleX = 1 - progress;
      this.cooldownBar.setFillStyle(0xff0000);
    } else {
      this.cooldownBar.scaleX = 1;
      this.cooldownBar.setFillStyle(0x00ff00);
      this.cooldownRemaining = 0;
    }

    this.updateStatusText();
  }

  performDash(pointer) {
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从玩家到鼠标位置）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 设置冲刺速度
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;
    
    this.player.setVelocity(velocityX, velocityY);

    // 改变颜色表示冲刺状态
    this.player.setTint(0xFFFFFF);

    // 冲刺持续时间
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0);
        this.player.clearTint();
      }
    });

    // 冷却时间
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
      }
    });
  }

  updateStatusText() {
    const dashStatus = this.canDash ? '就绪' : `冷却中(${(this.cooldownRemaining / 1000).toFixed(1)}s)`;
    this.statusText.setText(
      `冲刺次数: ${this.dashCount} | 状态: ${dashStatus}\n` +
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
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