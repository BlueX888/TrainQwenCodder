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
    // 初始化signals用于验证
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 150, 'Press WASD to take damage', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'Auto heal: 1 HP per 0.5s', {
      fontSize: '16px',
      color: '#88ff88'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 350, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听WASD键
    this.setupKeyboardInput();

    // 创建自动回血定时器（每0.5秒）
    this.healTimer = this.time.addEvent({
      delay: 500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志显示
    this.eventLog = this.add.text(50, 400, '', {
      fontSize: '14px',
      color: '#ffff00'
    });

    this.logEvent('Game started');
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (barWidth * 1.5 + barSpacing);
    const startY = 250;

    // 创建3个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景框
      const bg = this.add.graphics();
      bg.lineStyle(3, 0x666666, 1);
      bg.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充
      const healthBar = this.add.graphics();
      this.healthBars.push(healthBar);
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (barWidth * 1.5 + barSpacing);
    const startY = 250;

    // 更新每个血条的显示
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const healthBar = this.healthBars[i];
      
      healthBar.clear();
      
      if (i < this.currentHealth) {
        // 有生命值：显示红色
        healthBar.fillStyle(0xff0000, 1);
      } else {
        // 无生命值：显示深灰色
        healthBar.fillStyle(0x333333, 1);
      }
      
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 更新signals
    window.__signals__.health = this.currentHealth;
  }

  setupKeyboardInput() {
    // 监听WASD键
    const keys = ['W', 'A', 'S', 'D'];
    
    keys.forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.takeDamage(1);
      });
    });
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.logEvent(`Took ${amount} damage! Health: ${this.currentHealth}`);
      
      // 记录到signals
      window.__signals__.events.push({
        type: 'damage',
        amount: amount,
        health: this.currentHealth,
        timestamp: Date.now()
      });

      if (this.currentHealth === 0) {
        this.logEvent('Health depleted!');
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logEvent(`Auto heal +1! Health: ${this.currentHealth}`);
      
      // 记录到signals
      window.__signals__.events.push({
        type: 'heal',
        amount: 1,
        health: this.currentHealth,
        timestamp: Date.now()
      });
    }
  }

  logEvent(message) {
    console.log(`[HealthBar] ${message}`);
    
    // 更新屏幕日志（只显示最后一条）
    this.eventLog.setText(`Last event: ${message}`);
    
    // 输出JSON格式日志
    const logData = {
      timestamp: Date.now(),
      message: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth
    };
    console.log(JSON.stringify(logData));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

new Phaser.Game(config);