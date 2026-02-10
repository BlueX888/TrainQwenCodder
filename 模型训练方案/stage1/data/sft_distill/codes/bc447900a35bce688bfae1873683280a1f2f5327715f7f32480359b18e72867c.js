class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBarGraphics = null;
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
      logs: []
    };

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按空格键扣血 | 每1.5秒自动回血1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.updateHealthBar();

    // 创建健康值文本显示
    this.healthText = this.add.text(400, 250, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.updateHealthText();

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每1.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建日志显示文本
    this.logText = this.add.text(400, 350, '', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    this.logMessage('游戏开始 - 生命值: 3/3');
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 150;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);

      // 绘制血条背景（灰色边框）
      this.healthBarGraphics.lineStyle(3, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 绘制血条填充
      if (i < this.currentHealth) {
        // 有生命值 - 红色填充
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 无生命值 - 深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  /**
   * 更新健康值文本
   */
  updateHealthText() {
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  /**
   * 扣血函数
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateSignals();
      this.logMessage(`受到伤害 -${amount} | 当前生命值: ${this.currentHealth}/${this.maxHealth}`);

      if (this.currentHealth === 0) {
        this.logMessage('生命值耗尽！');
      }
    }
  }

  /**
   * 回血函数
   */
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateSignals();
      this.logMessage(`自动回血 +1 | 当前生命值: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  /**
   * 更新信号对象
   */
  updateSignals() {
    window.__signals__.health = this.currentHealth;
    console.log(JSON.stringify({
      type: 'health_update',
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  /**
   * 记录日志消息
   */
  logMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    window.__signals__.logs.push(logEntry);
    
    // 只显示最近3条日志
    const recentLogs = window.__signals__.logs.slice(-3);
    this.logText.setText(recentLogs.join('\n'));

    console.log(JSON.stringify({
      type: 'log',
      message: message,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);