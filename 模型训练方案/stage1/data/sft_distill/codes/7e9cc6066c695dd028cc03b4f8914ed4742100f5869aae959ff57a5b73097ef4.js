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
    // 初始化验证信号
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
    this.add.text(400, 100, '按空格键扣血，每3秒自动回复1点', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值数值显示
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每3秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志显示
    this.eventLogText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.logEvent('游戏开始');
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 5;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 250;

    // 创建10个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 背景（灰色边框）
      const bg = this.add.graphics();
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, startY, barWidth, barHeight);

      // 血条填充（红色）
      const bar = this.add.graphics();
      bar.fillStyle(0xff0000, 1);
      bar.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push(bar);
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.currentHealth) {
        // 显示血条
        this.healthBars[i].setAlpha(1);
      } else {
        // 隐藏血条
        this.healthBars[i].setAlpha(0);
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 3) {
      this.healthText.setColor('#ff0000'); // 低血量红色
    } else if (this.currentHealth <= 6) {
      this.healthText.setColor('#ffaa00'); // 中等血量橙色
    } else {
      this.healthText.setColor('#00ff00'); // 高血量绿色
    }

    // 更新验证信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.logEvent(`受到伤害 -${amount}，当前生命: ${this.currentHealth}`);

      // 添加受伤闪烁效果
      this.cameras.main.shake(100, 0.005);

      if (this.currentHealth === 0) {
        this.logEvent('生命值归零！');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logEvent(`自动回血 +1，当前生命: ${this.currentHealth}`);

      // 添加治疗闪光效果
      this.cameras.main.flash(200, 0, 255, 0, false);
    }
  }

  logEvent(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    
    // 更新屏幕显示（只显示最新3条）
    this.eventLogText.setText(logMessage);

    // 记录到验证信号
    window.__signals__.events.push({
      time: timestamp,
      message: message,
      health: this.currentHealth
    });

    // 控制台输出JSON格式
    console.log(JSON.stringify({
      event: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: timestamp
    }));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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