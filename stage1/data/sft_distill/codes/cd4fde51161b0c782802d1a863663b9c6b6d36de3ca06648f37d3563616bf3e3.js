class DashGameScene extends Phaser.Scene {
  constructor() {
    super('DashGameScene');
    this.dashCooldown = 0; // 冲刺冷却时间（秒）
    this.isDashing = false; // 是否正在冲刺
    this.dashDistance = 0; // 已冲刺距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 基础移动速度
    this.baseSpeed = 200;
    this.dashSpeed = this.baseSpeed * 3; // 600
    this.dashDuration = 0.3; // 冲刺持续时间（秒）
    this.dashCooldownTime = 2; // 冷却时间（秒）
    this.maxDashDistance = this.dashSpeed * this.dashDuration; // 最大冲刺距离

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.tryDash(pointer);
      }
    });

    // UI文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冲刺方向指示器（可视化反馈）
    this.dashIndicator = this.add.graphics();

    // 冷却计时器
    this.cooldownTimer = null;

    this.updateStatusText();
  }

  tryDash(pointer) {
    // 检查是否可以冲刺
    if (this.dashCooldown > 0 || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const dx = pointer.worldX - this.player.x;
    const dy = pointer.worldY - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // 归一化方向向量
    this.dashDirectionX = dx / distance;
    this.dashDirectionY = dy / distance;

    // 开始冲刺
    this.isDashing = true;
    this.dashDistance = 0;

    // 设置冲刺速度
    this.player.setVelocity(
      this.dashDirectionX * this.dashSpeed,
      this.dashDirectionY * this.dashSpeed
    );

    // 可视化反馈：改变颜色
    this.player.setTint(0xffff00); // 冲刺时变黄色

    // 绘制冲刺轨迹预测
    this.drawDashTrajectory(pointer);
  }

  drawDashTrajectory(pointer) {
    this.dashIndicator.clear();
    this.dashIndicator.lineStyle(2, 0xffff00, 0.5);
    this.dashIndicator.beginPath();
    this.dashIndicator.moveTo(this.player.x, this.player.y);
    this.dashIndicator.lineTo(pointer.worldX, pointer.worldY);
    this.dashIndicator.strokePath();
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // 更新冷却时间
    if (this.dashCooldown > 0) {
      this.dashCooldown -= deltaSeconds;
      if (this.dashCooldown < 0) {
        this.dashCooldown = 0;
      }
    }

    // 处理冲刺逻辑
    if (this.isDashing) {
      const currentSpeed = Math.sqrt(
        this.player.body.velocity.x ** 2 + 
        this.player.body.velocity.y ** 2
      );
      this.dashDistance += currentSpeed * deltaSeconds;

      // 检查是否完成冲刺
      if (this.dashDistance >= this.maxDashDistance) {
        this.endDash();
      }
    } else {
      // 正常移动控制
      this.handleNormalMovement();
    }

    this.updateStatusText();
  }

  endDash() {
    this.isDashing = false;
    this.dashDistance = 0;
    this.player.setVelocity(0, 0);
    this.player.clearTint(); // 恢复原色
    this.dashIndicator.clear();

    // 开始冷却
    this.dashCooldown = this.dashCooldownTime;
  }

  handleNormalMovement() {
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.baseSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.baseSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.baseSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.baseSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);
  }

  updateStatusText() {
    const status = this.isDashing ? 'DASHING!' : 
                   this.dashCooldown > 0 ? `Cooldown: ${this.dashCooldown.toFixed(1)}s` : 
                   'Ready';
    
    this.statusText.setText([
      `Status: ${status}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Dash Distance: ${Math.round(this.dashDistance)}/${Math.round(this.maxDashDistance)}`,
      '',
      'Controls:',
      '- Arrow Keys: Move',
      '- Right Click: Dash (2s cooldown)'
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
  scene: DashGameScene
};

new Phaser.Game(config);