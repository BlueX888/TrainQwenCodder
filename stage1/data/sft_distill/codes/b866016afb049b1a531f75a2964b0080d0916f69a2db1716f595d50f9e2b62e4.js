class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 程序化生成粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 生成冲刺拖尾效果纹理
    const trailGraphics = this.add.graphics();
    trailGraphics.fillStyle(0xff69b4, 0.3);
    trailGraphics.fillCircle(12, 12, 12);
    trailGraphics.generateTexture('trail', 24, 24);
    trailGraphics.destroy();
  }

  create() {
    // 创建物理引擎角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 添加WASD键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 冲刺参数
    this.normalSpeed = 300;
    this.dashSpeed = 300 * 3; // 900
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冷却时间（毫秒）

    // 创建UI文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 'WASD: 移动和冲刺\n按住方向键进行冲刺', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冲刺计时器
    this.dashTimer = null;
    this.cooldownTimer = null;

    // 创建拖尾粒子效果
    this.trailParticles = this.add.particles('trail');
    this.trailEmitter = this.trailParticles.createEmitter({
      speed: { min: 20, max: 50 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      frequency: 50,
      on: false
    });
  }

  update(time, delta) {
    this.updateStatusText();

    // 正常移动逻辑（非冲刺状态）
    if (!this.isDashing) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.keys.W.isDown) velocityY = -this.normalSpeed;
      if (this.keys.S.isDown) velocityY = this.normalSpeed;
      if (this.keys.A.isDown) velocityX = -this.normalSpeed;
      if (this.keys.D.isDown) velocityX = this.normalSpeed;

      // 归一化对角线速度
      if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= 0.707;
        velocityY *= 0.707;
      }

      this.player.setVelocity(velocityX, velocityY);

      // 检测冲刺输入
      if (this.canDash) {
        if (this.keys.W.isDown || this.keys.S.isDown || 
            this.keys.A.isDown || this.keys.D.isDown) {
          this.performDash();
        }
      }
    }

    // 更新冷却时间显示
    if (this.cooldownTimer && !this.canDash) {
      this.cooldownRemaining = Math.max(0, this.dashCooldown - this.cooldownTimer.getElapsed());
    } else {
      this.cooldownRemaining = 0;
    }
  }

  performDash() {
    // 确定冲刺方向
    let dashX = 0;
    let dashY = 0;

    if (this.keys.W.isDown) dashY = -1;
    if (this.keys.S.isDown) dashY = 1;
    if (this.keys.A.isDown) dashX = -1;
    if (this.keys.D.isDown) dashX = 1;

    // 归一化方向向量
    const magnitude = Math.sqrt(dashX * dashX + dashY * dashY);
    if (magnitude > 0) {
      dashX /= magnitude;
      dashY /= magnitude;
    }

    // 应用冲刺速度
    this.player.setVelocity(dashX * this.dashSpeed, dashY * this.dashSpeed);

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 启动拖尾效果
    this.trailEmitter.startFollow(this.player);
    this.trailEmitter.start();

    // 改变角色颜色（冲刺时更亮）
    this.player.setTint(0xffb6c1);

    // 冲刺持续时间计时器
    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        this.trailEmitter.stop();
      }
    });

    // 冷却计时器
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.cooldownTimer = null;
      }
    });
  }

  updateStatusText() {
    const cooldownText = this.canDash ? '准备就绪' : `冷却中: ${(this.cooldownRemaining / 1000).toFixed(1)}s`;
    const dashStatus = this.isDashing ? '冲刺中！' : '正常移动';
    
    this.statusText.setText(
      `冲刺次数: ${this.dashCount}\n` +
      `状态: ${dashStatus}\n` +
      `冷却: ${cooldownText}\n` +
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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