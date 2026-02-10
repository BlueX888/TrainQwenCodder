class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashSpeed = 200 * 3; // 冲刺速度
    this.normalSpeed = 200; // 正常速度
    this.dashDuration = 300; // 冲刺持续时间（毫秒）
    this.dashCooldown = 2500; // 冲刺冷却时间（毫秒）
    this.isDashing = false; // 是否正在冲刺
    this.canDash = true; // 是否可以冲刺
    this.dashCount = 0; // 冲刺次数（可验证状态）
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建目标指示器纹理
    const targetGraphics = this.add.graphics();
    targetGraphics.lineStyle(2, 0xff0000, 1);
    targetGraphics.strokeCircle(8, 8, 6);
    targetGraphics.generateTexture('target', 16, 16);
    targetGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建目标指示器（鼠标位置）
    this.targetIndicator = this.add.sprite(0, 0, 'target');
    this.targetIndicator.setVisible(false);

    // 添加鼠标输入监听
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.attemptDash(pointer);
      }
    });

    // 鼠标移动时显示目标指示器
    this.input.on('pointermove', (pointer) => {
      this.targetIndicator.setPosition(pointer.x, pointer.y);
      this.targetIndicator.setVisible(true);
    });

    // 创建状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建冷却条
    this.cooldownBar = this.add.graphics();
    
    // 创建说明文本
    this.add.text(10, 550, '点击鼠标左键进行冲刺', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 更新状态文本
    const status = `冲刺次数: ${this.dashCount}\n` +
                   `状态: ${this.isDashing ? '冲刺中' : (this.canDash ? '就绪' : '冷却中')}\n` +
                   `冷却剩余: ${(this.cooldownRemaining / 1000).toFixed(1)}秒`;
    this.statusText.setText(status);

    // 更新冷却条
    this.drawCooldownBar();

    // 如果正在冷却，更新剩余时间
    if (!this.canDash && this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - delta);
    }

    // 非冲刺状态下，正常移动减速
    if (!this.isDashing) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.95,
        this.player.body.velocity.y * 0.95
      );
    }
  }

  attemptDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向
    const angle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    // 计算冲刺速度向量
    const velocityX = Math.cos(angle) * this.dashSpeed;
    const velocityY = Math.sin(angle) * this.dashSpeed;

    // 设置冲刺状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 改变角色颜色表示冲刺状态
    this.player.setTint(0x00ffff);

    // 冲刺持续时间定时器
    this.time.addEvent({
      delay: this.dashDuration,
      callback: () => {
        this.isDashing = false;
        this.player.clearTint();
        
        // 开始冷却
        this.cooldownRemaining = this.dashCooldown;
        
        // 冷却时间定时器
        this.time.addEvent({
          delay: this.dashCooldown,
          callback: () => {
            this.canDash = true;
            this.cooldownRemaining = 0;
          }
        });
      }
    });
  }

  drawCooldownBar() {
    this.cooldownBar.clear();
    
    const barWidth = 200;
    const barHeight = 20;
    const barX = 10;
    const barY = 80;

    // 绘制背景
    this.cooldownBar.fillStyle(0x333333, 1);
    this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

    // 绘制冷却进度
    if (!this.canDash) {
      const progress = 1 - (this.cooldownRemaining / this.dashCooldown);
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);
    } else {
      // 就绪状态显示绿色满条
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
  scene: DashScene
};

new Phaser.Game(config);