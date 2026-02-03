class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 可验证的状态信号：冲刺次数
    this.canDash = true; // 冷却状态
    this.cooldownRemaining = 0; // 剩余冷却时间
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建红色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理角色
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(300); // 添加阻力，使冲刺后自然减速

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.performDash(pointer);
      }
    });

    // 创建UI文本显示
    this.dashText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 冷却指示器
    this.cooldownBar = this.add.graphics();

    this.updateUI();
  }

  performDash(pointer) {
    if (!this.canDash) {
      return;
    }

    // 计算从角色到鼠标的方向向量
    const dx = pointer.x - this.player.x;
    const dy = pointer.y - this.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return;
    }

    // 归一化方向向量
    const dirX = dx / distance;
    const dirY = dy / distance;

    // 冲刺速度 = 240 * 3 = 720
    const dashSpeed = 240 * 3;

    // 设置速度
    this.player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // 增加冲刺计数
    this.dashCount++;

    // 进入冷却状态
    this.canDash = false;
    this.cooldownRemaining = 2.0;

    // 创建冷却计时器（2秒）
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.canDash = true;
        this.cooldownRemaining = 0;
        this.updateUI();
      }
    });

    this.updateUI();
  }

  update(time, delta) {
    // 更新冷却时间
    if (!this.canDash && this.cooldownRemaining > 0) {
      this.cooldownRemaining -= delta / 1000;
      if (this.cooldownRemaining < 0) {
        this.cooldownRemaining = 0;
      }
      this.updateUI();
    }

    // 绘制冷却条
    this.cooldownBar.clear();
    if (!this.canDash) {
      const barWidth = 200;
      const barHeight = 20;
      const barX = 16;
      const barY = 60;

      // 背景
      this.cooldownBar.fillStyle(0x333333, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth, barHeight);

      // 冷却进度
      const progress = 1 - (this.cooldownRemaining / 2.0);
      this.cooldownBar.fillStyle(0x00ff00, 1);
      this.cooldownBar.fillRect(barX, barY, barWidth * progress, barHeight);

      // 边框
      this.cooldownBar.lineStyle(2, 0xffffff, 1);
      this.cooldownBar.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  updateUI() {
    const status = this.canDash ? 'READY' : `COOLDOWN: ${this.cooldownRemaining.toFixed(1)}s`;
    this.dashText.setText([
      `Dash Count: ${this.dashCount}`,
      `Status: ${status}`,
      `Click to dash!`
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
  scene: DashScene
};

new Phaser.Game(config);