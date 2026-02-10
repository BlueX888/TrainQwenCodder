class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.dashCount = 0; // 冲刺次数统计
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
    this.cooldownRemaining = 0; // 剩余冷却时间
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
    this.player.setDamping(true);
    this.player.setDrag(0.8); // 添加阻力使冲刺后减速

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 基础移动控制（可选，用于测试）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 更新状态显示
    this.updateStatus();
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.worldX,
      pointer.worldY
    );

    // 设置冲刺速度（200 * 3 = 600）
    const dashSpeed = 600;
    const velocityX = Math.cos(angle) * dashSpeed;
    const velocityY = Math.sin(angle) * dashSpeed;

    this.player.setVelocity(velocityX, velocityY);

    // 标记正在冲刺
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 冲刺持续时间（短距离冲刺，持续0.2秒）
    this.time.delayedCall(200, () => {
      this.isDashing = false;
      // 冲刺结束后减速
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 冷却时间2秒
    this.cooldownRemaining = 2000;
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
      }
    });

    this.updateStatus();
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    }

    // 基础移动控制（可选）
    if (!this.isDashing) {
      const speed = 200;
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      }
    }

    // 更新状态显示
    this.updateStatus();
    this.drawCooldownBar();
  }

  updateStatus() {
    const dashStatus = this.canDash ? '✓ Ready' : '✗ Cooling down';
    const cooldownTime = (this.cooldownRemaining / 1000).toFixed(1);
    
    this.statusText.setText([
      `Dash Status: ${dashStatus}`,
      `Cooldown: ${this.cooldownRemaining > 0 ? cooldownTime + 's' : '0s'}`,
      `Total Dashes: ${this.dashCount}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      '',
      'Controls:',
      '- Right Click: Dash towards cursor',
      '- Arrow Keys: Move (optional)'
    ]);
  }

  drawCooldownBar() {
    this.cooldownBar.clear();
    
    if (this.cooldownRemaining > 0) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 10;
      const barY = 180;
      
      // 背景
      this.cooldownBar.fillStyle(0x333333, 0.8);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);
      
      // 冷却进度
      const progress = 1 - (this.cooldownRemaining / 2000);
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // 边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
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
  scene: GameScene
};

new Phaser.Game(config);