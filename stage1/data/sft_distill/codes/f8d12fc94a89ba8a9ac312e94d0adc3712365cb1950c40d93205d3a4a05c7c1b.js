class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 300 * 3; // 900
    this.normalSpeed = 200;
    this.dashDuration = 200; // 冲刺持续时间(毫秒)
    this.dashCooldownTime = 2500; // 2.5秒冷却
    this.canDash = true;
    this.isDashing = false;
    this.dashCount = 0; // 可验证的状态信号
  }

  preload() {
    // 程序化生成粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 生成冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xcccccc, 0.5);
    cooldownGraphics.fillRect(0, 0, 100, 10);
    cooldownGraphics.generateTexture('cooldownBar', 100, 10);
    cooldownGraphics.destroy();
  }

  create() {
    // 创建粉色角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 创建UI文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBarBg = this.add.rectangle(400, 550, 100, 10, 0x333333);
    this.cooldownBarFill = this.add.rectangle(400, 550, 100, 10, 0x00ff00);
    this.cooldownBarFill.setOrigin(0.5, 0.5);

    // 添加说明文本
    this.add.text(400, 50, 'WASD键冲刺 | 冲刺速度: 900 | 冷却: 2.5秒', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 冷却计时器引用
    this.dashCooldownTimer = null;
    this.dashEndTimer = null;
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `速度: ${Math.floor(this.player.body.velocity.length())}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `冷却状态: ${this.canDash ? '就绪' : '冷却中'}`,
      `冲刺次数: ${this.dashCount}`
    ]);

    // 检测冲刺输入
    if (this.canDash && !this.isDashing) {
      let dashDirection = null;

      if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
        dashDirection = { x: 0, y: -1 };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
        dashDirection = { x: 0, y: 1 };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
        dashDirection = { x: -1, y: 0 };
      } else if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
        dashDirection = { x: 1, y: 0 };
      }

      if (dashDirection) {
        this.performDash(dashDirection);
      }
    }

    // 正常移动（非冲刺状态下的缓慢移动）
    if (!this.isDashing) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.keys.W.isDown) velocityY = -this.normalSpeed;
      if (this.keys.S.isDown) velocityY = this.normalSpeed;
      if (this.keys.A.isDown) velocityX = -this.normalSpeed;
      if (this.keys.D.isDown) velocityX = this.normalSpeed;

      this.player.setVelocity(velocityX, velocityY);
    }
  }

  performDash(direction) {
    // 开始冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 设置冲刺速度
    this.player.setVelocity(
      direction.x * this.dashSpeed,
      direction.y * this.dashSpeed
    );

    // 改变角色颜色表示冲刺状态
    this.player.setTint(0xffffff);

    // 冲刺持续时间结束
    if (this.dashEndTimer) {
      this.dashEndTimer.destroy();
    }
    this.dashEndTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.setVelocity(0, 0);
        this.player.clearTint();
      }
    });

    // 开始冷却计时
    if (this.dashCooldownTimer) {
      this.dashCooldownTimer.destroy();
    }
    
    let cooldownElapsed = 0;
    this.dashCooldownTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次冷却条
      repeat: this.dashCooldownTime / 50 - 1,
      callback: () => {
        cooldownElapsed += 50;
        const progress = cooldownElapsed / this.dashCooldownTime;
        this.cooldownBarFill.setScale(progress, 1);
        
        // 改变颜色从红到绿
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 255, b: 0 },
          100,
          progress * 100
        );
        this.cooldownBarFill.setFillStyle(
          Phaser.Display.Color.GetColor(color.r, color.g, color.b)
        );
      },
      callbackScope: this
    });

    // 冷却结束
    this.time.addEvent({
      delay: this.dashCooldownTime,
      callback: () => {
        this.canDash = true;
        this.cooldownBarFill.setScale(1, 1);
        this.cooldownBarFill.setFillStyle(0x00ff00);
      }
    });
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