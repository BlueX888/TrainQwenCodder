class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证状态：冲刺次数
    this.canDash = true; // 冷却状态
    this.dashSpeed = 80 * 3; // 冲刺速度
    this.dashDuration = 200; // 冲刺持续时间（毫秒）
    this.cooldownTime = 2000; // 冷却时间（毫秒）
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建蓝色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('bluePlayer', 40, 40);
    graphics.destroy();

    // 创建玩家精灵（屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'bluePlayer');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 创建冷却指示器
    this.cooldownIndicator = this.add.graphics();
    this.cooldownIndicator.setDepth(10);

    // 鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 添加键盘控制（WASD移动）
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加边界提示
    const bounds = this.add.graphics();
    bounds.lineStyle(2, 0xffffff, 0.5);
    bounds.strokeRect(0, 0, 800, 600);
  }

  performDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算冲刺方向（从玩家指向鼠标位置）
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 设置冲刺速度
    this.player.setVelocity(dirX * this.dashSpeed, dirY * this.dashSpeed);

    // 增加冲刺计数
    this.dashCount++;

    // 进入冷却状态
    this.canDash = false;
    this.cooldownStartTime = this.time.now;

    // 视觉反馈：玩家变亮
    this.player.setTint(0x8888ff);

    // 冲刺持续时间后减速
    this.time.delayedCall(this.dashDuration, () => {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
      this.player.clearTint();
    });

    // 冷却计时器
    this.time.addEvent({
      delay: this.cooldownTime,
      callback: () => {
        this.canDash = true;
        this.updateStatusText();
      }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 基础移动控制（慢速移动）
    const moveSpeed = 80;
    
    if (!this.isDashing()) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-moveSpeed);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(moveSpeed);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-moveSpeed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(moveSpeed);
      }
    }

    // 更新状态文本和冷却指示器
    this.updateStatusText();
    this.drawCooldownIndicator();
  }

  isDashing() {
    const speed = Math.sqrt(
      this.player.body.velocity.x ** 2 + 
      this.player.body.velocity.y ** 2
    );
    return speed > 150;
  }

  updateStatusText() {
    const status = this.canDash ? '✓ Ready' : '⏱ Cooling...';
    const cooldownRemaining = this.canDash 
      ? 0 
      : Math.max(0, this.cooldownTime - (this.time.now - this.cooldownStartTime));
    
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${status}`,
      `Cooldown: ${(cooldownRemaining / 1000).toFixed(1)}s`,
      '',
      'Click to dash towards cursor',
      'WASD to move slowly'
    ]);
  }

  drawCooldownIndicator() {
    this.cooldownIndicator.clear();

    if (!this.canDash) {
      const progress = Math.min(1, (this.time.now - this.cooldownStartTime) / this.cooldownTime);
      const radius = 30;
      const centerX = this.player.x;
      const centerY = this.player.y - 40;

      // 绘制冷却圆环
      this.cooldownIndicator.lineStyle(4, 0xff0000, 0.8);
      this.cooldownIndicator.beginPath();
      this.cooldownIndicator.arc(
        centerX, 
        centerY, 
        radius, 
        -Math.PI / 2, 
        -Math.PI / 2 + (Math.PI * 2 * progress),
        false
      );
      this.cooldownIndicator.strokePath();

      // 冷却完成时绘制绿色圆圈
      if (progress >= 1) {
        this.cooldownIndicator.lineStyle(4, 0x00ff00, 1);
        this.cooldownIndicator.strokeCircle(centerX, centerY, radius);
      }
    } else {
      // 可以冲刺时显示绿色圆圈
      this.cooldownIndicator.lineStyle(3, 0x00ff00, 0.6);
      this.cooldownIndicator.strokeCircle(this.player.x, this.player.y - 40, 30);
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