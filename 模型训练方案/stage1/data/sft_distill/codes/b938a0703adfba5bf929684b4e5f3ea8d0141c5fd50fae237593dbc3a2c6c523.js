class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 360 * 3; // 1080
    this.normalSpeed = 200;
    this.dashDuration = 200; // 冲刺持续时间(毫秒)
    this.dashCooldown = 500; // 冷却时间(毫秒)
    this.canDash = true;
    this.isDashing = false;
    this.dashCount = 0;
  }

  preload() {
    // 创建黄色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建冷却指示器纹理
    const cooldownGraphics = this.add.graphics();
    cooldownGraphics.fillStyle(0xff0000, 0.5);
    cooldownGraphics.fillCircle(8, 8, 8);
    cooldownGraphics.generateTexture('cooldown', 16, 16);
    cooldownGraphics.destroy();
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      dashCount: 0,
      canDash: true,
      isDashing: false,
      cooldownRemaining: 0,
      playerX: 400,
      playerY: 300,
      lastDashDirection: 'none'
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加空格键作为冲刺键（可选，方向键直接触发冲刺）
    this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建冷却指示器
    this.cooldownIndicator = this.add.sprite(400, 50, 'cooldown');
    this.cooldownIndicator.setVisible(false);

    // 创建UI文本
    this.dashText = this.add.text(16, 16, 'Dash Count: 0', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.cooldownText = this.add.text(16, 50, 'Cooldown: Ready', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(400, 550, 'Use Arrow Keys to move and dash', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      dashSpeed: this.dashSpeed,
      cooldown: this.dashCooldown
    }));
  }

  update(time, delta) {
    // 更新signals
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;
    window.__signals__.canDash = this.canDash;
    window.__signals__.isDashing = this.isDashing;

    // 正常移动
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

      // 检测冲刺触发（方向键刚按下时）
      if (this.canDash) {
        let dashDirection = null;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
          dashDirection = 'left';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
          dashDirection = 'right';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          dashDirection = 'up';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
          dashDirection = 'down';
        }

        if (dashDirection) {
          this.performDash(dashDirection);
        }
      }
    }

    // 更新UI
    this.dashText.setText(`Dash Count: ${this.dashCount}`);
    
    if (this.canDash) {
      this.cooldownText.setText('Cooldown: Ready');
      this.cooldownText.setStyle({ fill: '#00ff00' });
    }
  }

  performDash(direction) {
    if (!this.canDash) return;

    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 更新signals
    window.__signals__.dashCount = this.dashCount;
    window.__signals__.lastDashDirection = direction;

    // 根据方向设置冲刺速度
    let dashVelocityX = 0;
    let dashVelocityY = 0;

    switch (direction) {
      case 'left':
        dashVelocityX = -this.dashSpeed;
        break;
      case 'right':
        dashVelocityX = this.dashSpeed;
        break;
      case 'up':
        dashVelocityY = -this.dashSpeed;
        break;
      case 'down':
        dashVelocityY = this.dashSpeed;
        break;
    }

    this.player.setVelocity(dashVelocityX, dashVelocityY);

    // 视觉反馈：改变颜色
    this.player.setTint(0xffa500);

    // 日志输出
    console.log(JSON.stringify({
      event: 'dash_performed',
      timestamp: Date.now(),
      direction: direction,
      dashCount: this.dashCount,
      position: { x: this.player.x, y: this.player.y }
    }));

    // 冲刺持续时间
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      this.player.clearTint();
      this.player.setVelocity(0, 0);
    });

    // 冷却计时器
    this.cooldownIndicator.setVisible(true);
    let cooldownRemaining = this.dashCooldown;

    const cooldownTimer = this.time.addEvent({
      delay: 50,
      callback: () => {
        cooldownRemaining -= 50;
        window.__signals__.cooldownRemaining = cooldownRemaining;
        
        this.cooldownText.setText(`Cooldown: ${(cooldownRemaining / 1000).toFixed(2)}s`);
        this.cooldownText.setStyle({ fill: '#ff0000' });

        if (cooldownRemaining <= 0) {
          this.canDash = true;
          this.cooldownIndicator.setVisible(false);
          cooldownTimer.destroy();

          console.log(JSON.stringify({
            event: 'dash_ready',
            timestamp: Date.now(),
            totalDashes: this.dashCount
          }));
        }
      },
      repeat: Math.ceil(this.dashCooldown / 50) - 1
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