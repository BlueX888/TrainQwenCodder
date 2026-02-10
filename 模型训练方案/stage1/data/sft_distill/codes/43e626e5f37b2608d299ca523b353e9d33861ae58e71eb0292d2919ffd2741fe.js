class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    // 可验证状态
    this.dashCount = 0;
    this.isDashing = false;
    this.canDash = true;
    this.cooldownRemaining = 0;
  }

  preload() {
    // 创建粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0x666666, 0.7);
    cooldownGraphics.fillRect(0, 0, 100, 10);
    cooldownGraphics.generateTexture('cooldownBg', 100, 10);
    cooldownGraphics.destroy();

    const cooldownFillGraphics = this.add.graphics();
    cooldownFillGraphics.fillStyle(0x00ff00, 1);
    cooldownFillGraphics.fillRect(0, 0, 100, 10);
    cooldownFillGraphics.generateTexture('cooldownFill', 100, 10);
    cooldownFillGraphics.destroy();
  }

  create() {
    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500); // 添加拖拽减速效果

    // 冲刺参数
    this.dashSpeed = 900; // 300 * 3
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 3000; // 3秒冷却
    this.cooldownTimer = null;

    // 创建UI显示
    this.createUI();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 键盘控制（WASD移动）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加说明文字
    this.add.text(10, 10, 'Controls:', { 
      fontSize: '16px', 
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.add.text(10, 30, 'WASD - Move', { fontSize: '14px', color: '#ffffff' });
    this.add.text(10, 50, 'Right Click - Dash (3s cooldown)', { fontSize: '14px', color: '#ffffff' });
  }

  createUI() {
    // 状态显示文字
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却条背景
    this.cooldownBg = this.add.image(400, 580, 'cooldownBg');
    this.cooldownBg.setOrigin(0.5, 0.5);

    // 冷却条填充
    this.cooldownFill = this.add.image(400, 580, 'cooldownFill');
    this.cooldownFill.setOrigin(0.5, 0.5);
    this.cooldownFill.setScale(1, 1);

    // 冷却文字
    this.cooldownText = this.add.text(400, 570, 'READY', {
      fontSize: '14px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateStatusDisplay();
  }

  attemptDash(pointer) {
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

    // 执行冲刺
    this.performDash(angle);
  }

  performDash(angle) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 计算冲刺速度向量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 视觉效果：角色变亮
    this.player.setTint(0xffffff);

    // 冲刺持续时间结束后恢复
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
    });

    // 启动冷却计时器
    this.startCooldown();

    this.updateStatusDisplay();
  }

  startCooldown() {
    this.cooldownRemaining = this.dashCooldown;

    // 创建冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.updateStatusDisplay();
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    // 键盘移动控制（仅在非冲刺状态）
    if (!this.isDashing) {
      const speed = 200;
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -speed;
      } else if (this.cursors.right.isDown) {
        velocityX = speed;
      }

      if (this.cursors.up.isDown) {
        velocityY = -speed;
      } else if (this.cursors.down.isDown) {
        velocityY = speed;
      }

      // 归一化对角线速度
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      this.player.setVelocity(velocityX, velocityY);
    }

    // 更新冷却显示
    if (!this.canDash && this.cooldownTimer) {
      this.cooldownRemaining = this.cooldownTimer.getRemaining();
      const progress = 1 - (this.cooldownRemaining / this.dashCooldown);
      this.cooldownFill.setScale(progress, 1);
      
      this.cooldownText.setText(`Cooldown: ${(this.cooldownRemaining / 1000).toFixed(1)}s`);
      this.cooldownText.setColor('#ff0000');
    } else if (this.canDash) {
      this.cooldownFill.setScale(1, 1);
      this.cooldownText.setText('READY');
      this.cooldownText.setColor('#00ff00');
    }

    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const status = [
      `Dash Count: ${this.dashCount}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Can Dash: ${this.canDash ? 'YES' : 'NO'}`,
      `Is Dashing: ${this.isDashing ? 'YES' : 'NO'}`
    ];
    this.statusText.setText(status.join(' | '));
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