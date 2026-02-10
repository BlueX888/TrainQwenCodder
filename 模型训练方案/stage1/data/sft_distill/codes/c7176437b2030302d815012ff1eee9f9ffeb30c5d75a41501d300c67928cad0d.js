class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBarGraphics = null;
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按空格键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条图形对象
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建回血定时器（每4秒触发一次，循环执行）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志显示区域
    this.eventLogText = this.add.text(50, 400, '事件日志:', {
      fontSize: '16px',
      color: '#ffff00'
    });

    this.logEvent('游戏开始');
  }

  // 绘制血条
  drawHealthBar() {
    const barWidth = 30;  // 每格宽度
    const barHeight = 40; // 每格高度
    const gap = 5;        // 格子间隙
    const startX = 400 - (this.maxHealth * (barWidth + gap)) / 2; // 居中显示
    const startY = 200;

    this.healthBarGraphics.clear();

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      const y = startY;

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);

      // 填充颜色（满血红色，空血灰色）
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1); // 红色
      } else {
        this.healthBarGraphics.fillStyle(0x444444, 0.5); // 灰色
      }
      this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }
  }

  // 扣血
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthDisplay();
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;
      window.__signals__.events.push({
        type: 'damage',
        amount: amount,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      });

      this.logEvent(`受到 ${amount} 点伤害，剩余 ${this.currentHealth} 点`);

      // 屏幕震动效果
      this.cameras.main.shake(100, 0.005);

      if (this.currentHealth === 0) {
        this.logEvent('生命值归零！');
        this.healthText.setColor('#ff0000');
      }
    }
  }

  // 回血
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthDisplay();

      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      window.__signals__.events.push({
        type: 'heal',
        amount: 1,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      });

      this.logEvent(`回复 1 点生命值，当前 ${this.currentHealth} 点`);

      // 闪烁效果
      this.healthText.setColor('#00ff00');
      this.time.delayedCall(200, () => {
        if (this.currentHealth < this.maxHealth) {
          this.healthText.setColor('#00ff00');
        } else {
          this.healthText.setColor('#00ff00');
        }
      });
    }
  }

  // 更新生命值显示
  updateHealthDisplay() {
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    this.drawHealthBar();
  }

  // 记录事件日志
  logEvent(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // 保留最近5条日志
    if (!this.eventLogs) {
      this.eventLogs = [];
    }
    this.eventLogs.push(logMessage);
    if (this.eventLogs.length > 5) {
      this.eventLogs.shift();
    }

    // 更新显示
    this.eventLogText.setText('事件日志:\n' + this.eventLogs.join('\n'));

    // 输出到控制台
    console.log(JSON.stringify({
      event: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中主要逻辑在事件中处理）
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