class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证状态信号：冲刺次数
    this.canDash = true; // 是否可以冲刺
    this.isDashing = false; // 是否正在冲刺
    this.cooldownRemaining = 0; // 冷却剩余时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('bluePlayer', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'bluePlayer');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95); // 添加阻力使冲刺更自然

    // 创建UI文本
    this.dashText = this.add.text(10, 10, 'Dash Count: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.cooldownText = this.add.text(10, 40, 'Ready to Dash!', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    this.instructionText = this.add.text(10, 70, 'Left Click to Dash', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 监听鼠标左键按下
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 添加边界提示
    const boundsGraphics = this.add.graphics();
    boundsGraphics.lineStyle(2, 0xffffff, 0.5);
    boundsGraphics.strokeRect(0, 0, width, height);
  }

  performDash(pointer) {
    // 检查是否可以冲刺
    if (!this.canDash || this.isDashing) {
      return;
    }

    // 计算冲刺方向（从玩家指向鼠标位置）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 避免除以零
    if (distance === 0) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 冲刺速度：80 * 3 = 240
    const dashSpeed = 240;

    // 设置速度
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 更新状态
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++;
    this.dashText.setText(`Dash Count: ${this.dashCount}`);

    // 冲刺持续时间（短距离冲刺，约0.3秒）
    this.time.delayedCall(300, () => {
      this.isDashing = false;
      // 冲刺结束后减速
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 开始冷却（2秒）
    this.cooldownRemaining = 2000;
    this.cooldownText.setText('Cooldown: 2.0s');
    this.cooldownText.setColor('#ff0000');

    // 创建冷却计时器
    const cooldownTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.cooldownText.setText('Ready to Dash!');
        this.cooldownText.setColor('#00ff00');
      }
    });

    // 更新冷却显示
    this.updateCooldownDisplay();
  }

  updateCooldownDisplay() {
    if (this.cooldownRemaining > 0) {
      this.time.delayedCall(100, () => {
        this.cooldownRemaining -= 100;
        if (this.cooldownRemaining > 0) {
          const seconds = (this.cooldownRemaining / 1000).toFixed(1);
          this.cooldownText.setText(`Cooldown: ${seconds}s`);
          this.updateCooldownDisplay();
        }
      });
    }
  }

  update(time, delta) {
    // 显示玩家当前速度（用于调试）
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    );
    
    // 可选：在玩家下方显示速度
    if (!this.speedText) {
      this.speedText = this.add.text(0, 0, '', {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#000000'
      });
    }
    
    this.speedText.setPosition(this.player.x - 30, this.player.y + 25);
    this.speedText.setText(`Speed: ${Math.round(speed)}`);

    // 冲刺时改变角色颜色
    if (this.isDashing) {
      this.player.setTint(0xffff00); // 黄色表示冲刺中
    } else if (!this.canDash) {
      this.player.setTint(0x888888); // 灰色表示冷却中
    } else {
      this.player.clearTint(); // 恢复原色
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
  scene: DashScene
};

new Phaser.Game(config);