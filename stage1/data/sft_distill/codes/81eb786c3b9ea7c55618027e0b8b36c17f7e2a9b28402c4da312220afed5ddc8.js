class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '点击鼠标左键扣血，每秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本（用于验证状态）
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建3个血条方块
    this.createHealthBars();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血计时器，每1秒执行一次
    this.healTimer = this.time.addEvent({
      delay: 1000,           // 1秒
      callback: this.heal,   // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 550, '', {
      fontSize: '14px',
      color: '#888888'
    });
  }

  createHealthBars() {
    const startX = 250;
    const startY = 250;
    const barWidth = 80;
    const barHeight = 80;
    const spacing = 100;

    for (let i = 0; i < this.maxHealth; i++) {
      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(4, 0x666666, 1);
      background.strokeRect(startX + i * spacing, startY, barWidth, barHeight);

      // 创建填充（红色生命值）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(startX + i * spacing + 4, startY + 4, barWidth - 8, barHeight - 8);

      this.healthBars.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  updateHealthBars() {
    // 更新每个血条的显示状态
    for (let i = 0; i < this.healthBars.length; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();

      if (i < this.currentHealth) {
        // 有生命值：显示红色
        bar.fill.fillStyle(0xff0000, 1);
        const startX = 250 + i * 100;
        const startY = 250;
        bar.fill.fillRect(startX + 4, startY + 4, 72, 72);
        bar.active = true;
      } else {
        // 无生命值：显示深灰色
        bar.fill.fillStyle(0x333333, 0.5);
        const startX = 250 + i * 100;
        const startY = 250;
        bar.fill.fillRect(startX + 4, startY + 4, 72, 72);
        bar.active = false;
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth === 0) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth === this.maxHealth) {
      this.healthText.setColor('#00ff00');
    } else {
      this.healthText.setColor('#ffff00');
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBars();
      
      // 更新调试信息
      this.debugText.setText(`扣血 -${amount}，当前生命: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        console.log('生命值归零！');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBars();
      
      // 更新调试信息
      this.debugText.setText(`自动回血 +1，当前生命: ${this.currentHealth}`);
    }
  }

  update(time, delta) {
    // 显示计时器信息（可选，用于调试）
    const elapsed = this.healTimer.getElapsed();
    const remaining = this.healTimer.getRemaining();
    // 可以在这里添加更多的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

new Phaser.Game(config);