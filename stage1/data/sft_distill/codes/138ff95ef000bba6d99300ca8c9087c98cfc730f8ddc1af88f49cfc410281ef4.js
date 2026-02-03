class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    
    // 用于验证的信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 150, '按空格键扣血 | 每2秒自动回复1点', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBars();

    // 显示当前血量文本
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 事件日志文本
    this.eventLog = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每2秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('游戏开始', this.currentHealth);
  }

  createHealthBars() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2 + barWidth / 2;
    const startY = 300;

    // 创建每个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 背景边框
      const border = this.add.graphics();
      border.lineStyle(3, 0x333333, 1);
      border.strokeRect(x - barWidth / 2, startY - barHeight / 2, barWidth, barHeight);

      // 血条填充（使用Graphics）
      const healthBar = this.add.graphics();
      this.healthBars.push(healthBar);
      
      // 初始全部填充为红色
      this.updateHealthBar(i, true);
    }
  }

  updateHealthBar(index, isFilled) {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2 + barWidth / 2;
    const startY = 300;
    const x = startX + index * (barWidth + barSpacing);

    const healthBar = this.healthBars[index];
    healthBar.clear();

    if (isFilled) {
      // 红色表示有血
      healthBar.fillStyle(0xff0000, 1);
    } else {
      // 深灰色表示已损失
      healthBar.fillStyle(0x444444, 1);
    }
    
    healthBar.fillRect(x - barWidth / 2 + 3, startY - barHeight / 2 + 3, barWidth - 6, barHeight - 6);
  }

  updateAllHealthBars() {
    for (let i = 0; i < this.maxHealth; i++) {
      this.updateHealthBar(i, i < this.currentHealth);
    }
    
    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新验证信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateAllHealthBars();
      this.logEvent('受到伤害', this.currentHealth);
      
      if (this.currentHealth === 0) {
        this.showMessage('生命值耗尽！', 0xff0000);
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateAllHealthBars();
      this.logEvent('自动回复', this.currentHealth);
      this.showMessage('+1 HP', 0x00ff00);
    }
  }

  logEvent(eventType, health) {
    const timestamp = Math.floor(this.time.now / 1000);
    const eventData = {
      time: timestamp,
      type: eventType,
      health: health
    };
    
    window.__signals__.events.push(eventData);
    
    // 控制台输出JSON格式日志
    console.log(JSON.stringify(eventData));
  }

  showMessage(text, color) {
    this.eventLog.setText(text);
    this.eventLog.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后清除消息
    this.time.delayedCall(2000, () => {
      if (this.eventLog.text === text) {
        this.eventLog.setText('');
      }
    });
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
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