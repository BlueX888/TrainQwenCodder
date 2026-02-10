class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBars = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '点击鼠标左键扣血，每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
        this.logEvent('damage', 1);
      }
    });

    // 创建自动回血定时器（每3秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志显示
    this.eventLog = this.add.text(50, 400, '事件日志:', {
      fontSize: '16px',
      color: '#ffff00'
    });

    this.logEvent('init', this.currentHealth);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (barWidth + gap)) / 2;
    const startY = 250;

    // 清空旧的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    // 创建10格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      const graphics = this.add.graphics();

      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);

      // 绘制填充（根据当前生命值决定颜色）
      if (i < this.currentHealth) {
        graphics.fillStyle(0x00ff00, 1); // 绿色表示有生命值
      } else {
        graphics.fillStyle(0x333333, 1); // 灰色表示已损失
      }
      graphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push(graphics);
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthDisplay();
      
      // 显示伤害提示
      this.showDamageText(amount);
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthDisplay();
      this.logEvent('heal', 1);
      
      // 显示治疗提示
      this.showHealText(1);
    }
  }

  updateHealthDisplay() {
    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 3) {
      this.healthText.setColor('#ff0000'); // 红色警告
    } else if (this.currentHealth <= 6) {
      this.healthText.setColor('#ffaa00'); // 橙色提示
    } else {
      this.healthText.setColor('#00ff00'); // 绿色健康
    }

    // 重新绘制血条
    this.createHealthBar();

    // 更新信号
    window.__signals__.health = this.currentHealth;
  }

  showDamageText(amount) {
    const damageText = this.add.text(400, 200, `-${amount}`, {
      fontSize: '32px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加动画效果
    this.tweens.add({
      targets: damageText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }

  showHealText(amount) {
    const healText = this.add.text(400, 200, `+${amount}`, {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加动画效果
    this.tweens.add({
      targets: healText,
      y: 150,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        healText.destroy();
      }
    });
  }

  logEvent(type, value) {
    const timestamp = Date.now();
    const event = {
      type,
      value,
      health: this.currentHealth,
      timestamp
    };

    window.__signals__.events.push(event);

    // 保持最多显示最近5条事件
    const recentEvents = window.__signals__.events.slice(-5);
    const logText = recentEvents.map(e => {
      const time = new Date(e.timestamp).toLocaleTimeString();
      if (e.type === 'damage') {
        return `[${time}] 受到伤害 -${e.value} (剩余: ${e.health})`;
      } else if (e.type === 'heal') {
        return `[${time}] 自动回复 +${e.value} (剩余: ${e.health})`;
      } else {
        return `[${time}] 初始化 (生命值: ${e.health})`;
      }
    }).join('\n');

    this.eventLog.setText('事件日志:\n' + logText);

    // 输出到控制台
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 本例中无需每帧更新逻辑
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