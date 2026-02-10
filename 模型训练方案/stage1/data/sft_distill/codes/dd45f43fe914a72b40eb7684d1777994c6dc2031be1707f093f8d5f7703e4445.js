class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文字
    this.add.text(400, 100, 'Click to take damage | Auto heal every 0.5s', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条显示
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 设置自动回血定时器（每0.5秒）
    this.healTimer = this.time.addEvent({
      delay: 500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 80;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 250;

    // 创建10个血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景框（边框）
      const border = this.add.graphics();
      border.lineStyle(3, 0x333333, 1);
      border.strokeRect(x, startY, barWidth, barHeight);

      // 创建血格填充
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({
        graphics: healthBar,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    // 更新每个血格的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();

      if (i < this.currentHealth) {
        // 有血：红色
        bar.graphics.fillStyle(0xff0000, 1);
      } else {
        // 无血：深灰色
        bar.graphics.fillStyle(0x444444, 1);
      }

      bar.graphics.fillRect(
        bar.x + 3,
        bar.y + 3,
        bar.width - 6,
        bar.height - 6
      );
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      // 添加伤害反馈效果
      this.cameras.main.shake(100, 0.005);
      
      this.debugText.setText(`Damage taken! Health: ${this.currentHealth}`);
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      
      this.debugText.setText(`Healed! Health: ${this.currentHealth}`);
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);