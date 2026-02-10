class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 当前生命值
    this.maxHealth = 3; // 最大生命值
    this.healthBars = []; // 存储血条格子
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Right Click to take damage\nAuto heal 1HP every 0.5s', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 400, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器，每 0.5 秒执行一次
    this.healTimer = this.time.addEvent({
      delay: 500, // 0.5 秒
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  // 创建血条显示
  createHealthBar() {
    const startX = 250; // 血条起始 X 坐标
    const startY = 250; // 血条起始 Y 坐标
    const barWidth = 80; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const gap = 10; // 格子间距

    // 创建 3 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      // 创建背景（空血槽）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, startY, barWidth, barHeight);
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建前景（血量显示）
      const foreground = this.add.graphics();
      foreground.fillStyle(0xff0000, 1);
      foreground.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background: background,
        foreground: foreground,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }

    this.updateHealthBar();
  }

  // 更新血条显示
  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.foreground.clear();

      // 如果当前索引小于生命值，显示红色血条
      if (i < this.health) {
        bar.foreground.fillStyle(0xff0000, 1);
        bar.foreground.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
  }

  // 扣血函数
  takeDamage(amount) {
    if (this.health > 0) {
      this.health = Math.max(0, this.health - amount);
      this.updateHealthBar();
      this.debugText.setText(`Took ${amount} damage! Health: ${this.health}`);
      
      // 闪烁效果
      this.cameras.main.shake(100, 0.005);
    }
  }

  // 自动回血函数
  autoHeal() {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.updateHealthBar();
      this.debugText.setText(`Healed 1HP! Health: ${this.health}`);
      
      // 回血闪光效果
      this.cameras.main.flash(100, 0, 255, 0, false);
    }
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);