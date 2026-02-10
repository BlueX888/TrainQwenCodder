class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'Auto heal 1 HP every 4 seconds', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(400, 350, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 绘制初始血条
    this.updateHealthBar();

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每4秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志文本区域
    this.logText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.logMessage('Game started - Full health');
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    const barWidth = 40; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 5; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 250;

    this.healthBarGraphics.clear();

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制血条背景（深灰色）
      this.healthBarGraphics.fillStyle(0x333333, 1);
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);

      // 如果当前格有生命值，绘制红色
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      } else {
        // 损失的生命值显示为灰色
        this.healthBarGraphics.fillStyle(0x666666, 1);
        this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      }

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0xffffff, 0.5);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
    }

    // 更新文本显示
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);

    // 更新信号
    window.__signals__.health = this.currentHealth;
  }

  /**
   * 受到伤害
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      const event = {
        type: 'damage',
        amount: amount,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      };
      window.__signals__.events.push(event);
      
      this.logMessage(`Took ${amount} damage! HP: ${this.currentHealth}/${this.maxHealth}`);
      console.log(JSON.stringify(event));

      if (this.currentHealth === 0) {
        this.logMessage('Health depleted!');
      }
    }
  }

  /**
   * 自动回血
   */
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      
      const event = {
        type: 'heal',
        amount: 1,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      };
      window.__signals__.events.push(event);
      
      this.logMessage(`Auto healed 1 HP! HP: ${this.currentHealth}/${this.maxHealth}`);
      console.log(JSON.stringify(event));
    }
  }

  /**
   * 显示日志消息
   */
  logMessage(message) {
    this.logText.setText(message);
    
    // 3秒后清除消息
    this.time.delayedCall(3000, () => {
      if (this.logText.text === message) {
        this.logText.setText('');
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);