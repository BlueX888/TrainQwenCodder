class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 300; // 防止连续扣血
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage\nAuto Heal: +1 HP every 3 seconds', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志显示区域
    this.eventLogText = this.add.text(50, 400, 'Event Log:', {
      fontSize: '16px',
      color: '#ffff00'
    });

    this.logEvent('Game Started', this.currentHealth);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 50;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 220;

    // 清除旧的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    // 创建8格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 绘制背景边框（灰色）
      graphics.lineStyle(3, 0x666666, 1);
      graphics.strokeRect(x, y, barWidth, barHeight);

      // 如果当前格有生命值，填充红色
      if (i < this.currentHealth) {
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(x + 3, y + 3, barWidth - 6, barHeight - 6);
      }

      this.healthBars.push(graphics);
    }
  }

  updateHealthBar() {
    const barWidth = 50;
    const barHeight = 50;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 220;

    // 重新绘制所有血条
    this.healthBars.forEach((graphics, i) => {
      graphics.clear();
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 绘制边框
      graphics.lineStyle(3, 0x666666, 1);
      graphics.strokeRect(x, y, barWidth, barHeight);

      // 根据当前生命值填充
      if (i < this.currentHealth) {
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(x + 3, y + 3, barWidth - 6, barHeight - 6);
      }
    });

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 更新验证信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.logEvent('Took Damage', this.currentHealth);

      if (this.currentHealth === 0) {
        this.logEvent('Health Depleted!', 0);
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.logEvent('Auto Heal', this.currentHealth);
    }
  }

  logEvent(eventName, health) {
    const timestamp = new Date().toLocaleTimeString();
    const eventData = {
      time: timestamp,
      event: eventName,
      health: health
    };

    window.__signals__.events.push(eventData);

    // 更新日志显示（只显示最后5条）
    const recentEvents = window.__signals__.events.slice(-5);
    let logText = 'Event Log:\n';
    recentEvents.forEach(e => {
      logText += `[${e.time}] ${e.event} - HP: ${e.health}\n`;
    });
    this.eventLogText.setText(logText);

    // 输出到控制台
    console.log(JSON.stringify(eventData));
  }

  update(time, delta) {
    // 检测方向键输入（带防抖）
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.left.isDown || 
          this.cursors.right.isDown || 
          this.cursors.up.isDown || 
          this.cursors.down.isDown) {
        this.takeDamage();
        this.lastKeyPressTime = time;
      }
    }
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