class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.healTimer = null;
    
    // 可验证的信号
    window.__signals__ = {
      health: 10,
      maxHealth: 10,
      damageCount: 0,
      healCount: 0,
      logs: []
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto heal 1 HP every 3 seconds', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 180, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条图形对象
    this.healthBarGraphics = this.add.graphics();
    this.updateHealthBar();

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });

    // 创建每3秒回血的定时器
    this.healTimer = this.time.addEvent({
      delay: 3000,           // 3秒
      callback: this.heal,   // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 创建日志文本区域
    this.logText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.log('Game started - Health: 10/10');
  }

  /**
   * 扣血方法
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateSignals();
      
      window.__signals__.damageCount++;
      this.log(`Took ${amount} damage - Health: ${this.currentHealth}/${this.maxHealth}`);
      
      if (this.currentHealth === 0) {
        this.log('Health depleted!');
      }
    }
  }

  /**
   * 回血方法
   */
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateSignals();
      
      window.__signals__.healCount++;
      this.log(`Healed 1 HP - Health: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    const barWidth = 40;  // 每格宽度
    const barHeight = 30; // 血条高度
    const spacing = 5;    // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + spacing) - spacing) / 2;
    const startY = 250;

    // 清空之前的绘制
    this.healthBarGraphics.clear();

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 当前生命值部分 - 绿色
        this.healthBarGraphics.fillStyle(0x00ff00, 1);
      } else {
        // 已损失生命值部分 - 红色
        this.healthBarGraphics.fillStyle(0xff0000, 0.3);
      }
      this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  /**
   * 更新可验证信号
   */
  updateSignals() {
    window.__signals__.health = this.currentHealth;
    window.__signals__.maxHealth = this.maxHealth;
  }

  /**
   * 记录日志
   */
  log(message) {
    const timestamp = this.time.now;
    const logEntry = {
      time: timestamp,
      message: message,
      health: this.currentHealth
    };
    
    window.__signals__.logs.push(logEntry);
    
    // 只显示最近3条日志
    const recentLogs = window.__signals__.logs.slice(-3);
    const displayText = recentLogs.map(log => log.message).join('\n');
    this.logText.setText(displayText);
    
    // 同时输出到控制台
    console.log(`[${timestamp.toFixed(0)}ms] ${message}`);
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
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);