class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.dashCount = 0; // 冲刺次数
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺（冷却状态）
    this.normalSpeed = 160; // 正常速度
    this.dashSpeed = 160 * 3; // 冲刺速度 = 480
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.dashCooldown = 1500; // 冷却时间（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建带物理的玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建方向键和空格键
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却指示器
    this.cooldownBar = this.add.graphics();
    
    // 添加说明文本
    this.add.text(10, 550, '方向键移动 | 空格键冲刺（冷却1.5秒）', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `冲刺次数: ${this.dashCount}`,
      `冲刺状态: ${this.isDashing ? '冲刺中' : '正常'}`,
      `冷却状态: ${this.canDash ? '就绪' : '冷却中'}`,
      `当前速度: ${Math.round(Math.sqrt(this.player.body.velocity.x ** 2 + this.player.body.velocity.y ** 2))}`
    ]);

    // 如果不在冲刺状态，处理正常移动
    if (!this.isDashing) {
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

      // 处理冲刺输入
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canDash) {
        this.performDash();
      }
    }

    // 绘制冷却条
    this.drawCooldownBar();
  }

  performDash() {
    // 获取当前移动方向
    let dashX = 0;
    let dashY = 0;

    if (this.cursors.left.isDown) {
      dashX = -1;
    } else if (this.cursors.right.isDown) {
      dashX = 1;
    }

    if (this.cursors.up.isDown) {
      dashY = -1;
    } else if (this.cursors.down.isDown) {
      dashY = 1;
    }

    // 如果没有方向输入，默认向右冲刺
    if (dashX === 0 && dashY === 0) {
      dashX = 1;
    }

    // 归一化方向向量
    const length = Math.sqrt(dashX * dashX + dashY * dashY);
    dashX /= length;
    dashY /= length;

    // 设置冲刺速度
    this.player.setVelocity(dashX * this.dashSpeed, dashY * this.dashSpeed);

    // 更新状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 改变颜色表示冲刺状态
    this.player.setTint(0xffff00);

    // 冲刺持续时间结束
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
      }
    });

    // 冷却时间结束
    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldown,
      callback: () => {
        this.canDash = true;
      }
    });
  }

  drawCooldownBar() {
    this.cooldownBar.clear();
    
    const barWidth = 200;
    const barHeight = 20;
    const barX = 10;
    const barY = 100;

    // 绘制背景
    this.cooldownBar.fillStyle(0x333333, 1);
    this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

    // 绘制冷却进度
    if (!this.canDash && this.cooldownTimer) {
      const progress = this.cooldownTimer.getProgress();
      const fillWidth = barWidth * progress;
      
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, fillWidth, barHeight);
    } else if (this.canDash) {
      // 就绪状态显示满条
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);
    }

    // 绘制边框
    this.cooldownBar.lineStyle(2, 0xffffff, 1);
    this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
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