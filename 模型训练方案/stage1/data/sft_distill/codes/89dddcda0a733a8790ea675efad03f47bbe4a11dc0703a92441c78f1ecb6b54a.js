class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.cursors = null;
    this.healTimer = null;
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 防止按键过快
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto Heal: +1 HP every 0.5 seconds', {
      fontSize: '18px',
      color: '#88ff88',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 200, `Health: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条背景和显示
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器（每0.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 500, // 0.5秒
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('game_start', { health: this.currentHealth });

    // 创建事件日志显示区域
    this.eventLogText = this.add.text(50, 400, 'Event Log:', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 检测方向键输入（带防抖）
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.left.isDown || this.cursors.right.isDown || 
          this.cursors.up.isDown || this.cursors.down.isDown) {
        this.takeDamage(1);
        this.lastKeyPressTime = time;
      }
    }
  }

  // 绘制血条
  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 30; // 每格宽度
    const barHeight = 40; // 每格高度
    const barSpacing = 5; // 格子间距
    const startX = 100; // 起始X坐标
    const startY = 250; // 起始Y坐标
    const barsPerRow = 10; // 每行显示10格

    for (let i = 0; i < this.maxHealth; i++) {
      const row = Math.floor(i / barsPerRow);
      const col = i % barsPerRow;
      const x = startX + col * (barWidth + barSpacing);
      const y = startY + row * (barHeight + barSpacing);

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x333333, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);

      // 绘制填充（红色表示当前血量，灰色表示损失血量）
      if (i < this.currentHealth) {
        // 当前血量：红色渐变效果
        const healthPercent = this.currentHealth / this.maxHealth;
        let color = 0xff0000; // 红色
        if (healthPercent > 0.5) {
          color = 0x00ff00; // 绿色（血量充足）
        } else if (healthPercent > 0.25) {
          color = 0xffaa00; // 橙色（血量中等）
        }
        this.healthBarGraphics.fillStyle(color, 1);
      } else {
        // 损失的血量：深灰色
        this.healthBarGraphics.fillStyle(0x444444, 1);
      }
      this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }
  }

  // 受到伤害
  takeDamage(amount) {
    if (this.currentHealth <= 0) {
      return; // 已经死亡，不再扣血
    }

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateDisplay();
    this.logEvent('take_damage', { damage: amount, health: this.currentHealth });

    if (this.currentHealth === 0) {
      this.logEvent('death', { health: 0 });
    }
  }

  // 自动回血
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateDisplay();
      this.logEvent('auto_heal', { heal: 1, health: this.currentHealth });
    }
  }

  // 更新显示
  updateDisplay() {
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
    this.drawHealthBar();

    // 更新信号
    window.__signals__.health = this.currentHealth;
  }

  // 记录事件日志
  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    
    window.__signals__.events.push(event);
    
    // 控制台输出JSON格式
    console.log(JSON.stringify(event));

    // 更新屏幕显示（只显示最近5条）
    const recentEvents = window.__signals__.events.slice(-5);
    const logText = 'Event Log:\n' + recentEvents.map(e => 
      `[${e.type}] HP: ${e.data.health}`
    ).join('\n');
    this.eventLogText.setText(logText);
  }
}

// Phaser游戏配置
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