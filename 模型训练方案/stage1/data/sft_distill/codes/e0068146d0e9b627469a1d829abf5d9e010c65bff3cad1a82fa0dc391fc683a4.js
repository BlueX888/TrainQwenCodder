class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    // 状态信号变量
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.dashOnCooldown = false; // 是否在冷却中
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.baseSpeed = 160;
    this.dashSpeed = this.baseSpeed * 3; // 480
    this.dashDuration = 200; // 冲刺持续时间 200ms
    this.dashCooldown = 1500; // 冷却时间 1.5秒

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却条背景
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x333333, 1);
    this.cooldownBarBg.fillRect(10, 50, 200, 20);

    // 创建冷却条
    this.cooldownBar = this.add.graphics();

    // 创建地面参考线
    const ground = this.add.graphics();
    ground.lineStyle(2, 0x00ff00, 1);
    ground.lineBetween(0, 580, 800, 580);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Dashing: ${this.isDashing}`,
      `Cooldown: ${this.dashOnCooldown}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);

    // 基础移动控制
    if (!this.isDashing) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.baseSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.baseSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.baseSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.baseSpeed);
      }
    }

    // 检测空格键按下并执行冲刺
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isDashing && !this.dashOnCooldown) {
      this.performDash();
    }

    // 更新冷却条显示
    this.updateCooldownBar();
  }

  performDash() {
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

    // 如果没有按方向键，默认向右冲刺
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

    // 改变颜色表示冲刺状态
    this.player.setTint(0xff00ff);

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        this.player.setVelocity(0);
        
        // 开始冷却
        this.startCooldown();
      }
    });
  }

  startCooldown() {
    this.dashOnCooldown = true;
    this.cooldownStartTime = this.time.now;

    // 冷却时间结束
    this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.dashOnCooldown = false;
        this.cooldownStartTime = null;
      }
    });
  }

  updateCooldownBar() {
    this.cooldownBar.clear();

    if (this.dashOnCooldown && this.cooldownStartTime) {
      const elapsed = this.time.now - this.cooldownStartTime;
      const progress = Math.min(elapsed / this.dashCooldown, 1);
      const barWidth = 200 * progress;

      this.cooldownBar.fillStyle(0x00ffff, 1);
      this.cooldownBar.fillRect(10, 50, barWidth, 20);
    } else if (!this.dashOnCooldown) {
      // 冷却完成，显示满条
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(10, 50, 200, 20);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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