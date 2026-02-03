class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    this.dashSpeed = 240 * 3; // 720
    this.normalSpeed = 240;
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2000; // 冷却时间2秒
    this.canDash = true; // 可验证的状态信号
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（启用物理）
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocity(0, 0);

    // 添加状态文本
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

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.tryDash(pointer);
      }
    });

    // 添加键盘控制（用于移动角色）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化冷却计时器引用
    this.cooldownTimer = null;
    this.dashTimer = null;

    this.updateStatusText();
  }

  tryDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算冲刺方向（从角色指向鼠标）
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 执行冲刺
    this.performDash(angle);
  }

  performDash(angle) {
    // 设置冲刺状态
    this.canDash = false;
    this.dashCount++;

    // 计算冲刺速度向量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 冲刺持续时间后恢复正常速度
    if (this.dashTimer) {
      this.dashTimer.destroy();
    }

    this.dashTimer = this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        // 恢复为较慢的速度
        const currentVelX = this.player.body.velocity.x;
        const currentVelY = this.player.body.velocity.y;
        const currentSpeed = Math.sqrt(currentVelX * currentVelX + currentVelY * currentVelY);
        
        if (currentSpeed > 0) {
          const normalizedX = currentVelX / currentSpeed;
          const normalizedY = currentVelY / currentSpeed;
          this.player.setVelocity(
            normalizedX * this.normalSpeed,
            normalizedY * this.normalSpeed
          );
        }
      },
      callbackScope: this
    });

    // 启动冷却计时器
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      },
      callbackScope: this
    });

    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.canDash ? 'READY' : 'COOLING DOWN';
    const color = this.canDash ? '#00ff00' : '#ff0000';
    
    this.statusText.setText([
      `Dash Status: ${status}`,
      `Dash Count: ${this.dashCount}`,
      `Speed: ${Math.round(this.player.body.velocity.length())}`
    ]);
    
    this.statusText.setColor(color);
  }

  update(time, delta) {
    // 键盘控制（可选，用于移动角色测试冲刺）
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

    // 更新冷却显示
    if (!this.canDash && this.cooldownTimer) {
      const remaining = this.cooldownTimer.getRemaining();
      this.cooldownText.setText(`Cooldown: ${(remaining / 1000).toFixed(1)}s`);
      this.cooldownText.setVisible(true);
    } else {
      this.cooldownText.setVisible(false);
    }

    // 实时更新状态文本
    this.updateStatusText();
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