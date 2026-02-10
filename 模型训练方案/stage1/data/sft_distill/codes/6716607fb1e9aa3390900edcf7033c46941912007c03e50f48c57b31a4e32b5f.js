class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healTimer = null;
    
    // 可验证的信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      logs: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage\nAuto heal: 1 HP per 1.5 seconds', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 350, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听 WASD 键
    this.input.keyboard.on('keydown-W', () => this.takeDamage());
    this.input.keyboard.on('keydown-A', () => this.takeDamage());
    this.input.keyboard.on('keydown-S', () => this.takeDamage());
    this.input.keyboard.on('keydown-D', () => this.takeDamage());

    // 创建自动回血定时器（每 1.5 秒）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志文本显示区域
    this.logText = this.add.text(50, 450, '', {
      fontSize: '16px',
      color: '#00ff00'
    });

    this.log('Game started. Current health: ' + this.currentHealth);
  }

  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 200;

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 有生命值：红色
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        // 无生命值：暗灰色
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealth();
      window.__signals__.damageCount++;
      this.log(`Took damage! Health: ${this.currentHealth}/${this.maxHealth}`);
      
      if (this.currentHealth === 0) {
        this.log('Health depleted!');
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealth();
      window.__signals__.healCount++;
      this.log(`Auto heal! Health: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  updateHealth() {
    // 更新血条显示
    this.drawHealthBar();
    
    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新信号
    window.__signals__.health = this.currentHealth;
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    // 添加到信号日志
    window.__signals__.logs.push({
      time: timestamp,
      message: message,
      health: this.currentHealth
    });
    
    // 限制日志数量
    if (window.__signals__.logs.length > 10) {
      window.__signals__.logs.shift();
    }
    
    // 更新显示的最后 3 条日志
    const recentLogs = window.__signals__.logs.slice(-3);
    this.logText.setText(recentLogs.map(log => `[${log.time}] ${log.message}`).join('\n'));
    
    // 控制台输出 JSON 格式
    console.log(JSON.stringify({
      event: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: timestamp
    }));
  }

  update(time, delta) {
    // 每帧更新不需要特殊处理
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