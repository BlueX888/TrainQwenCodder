class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBars = [];
    
    // 可验证的信号输出
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
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '点击鼠标左键扣血，每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建事件日志文本
    this.eventLog = this.add.text(400, 500, '事件日志:', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回复定时器，每3秒回复1点生命值
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('游戏开始', this.currentHealth);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barGap = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2;
    const startY = 250;

    // 创建10个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(2, 0x666666, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制填充（初始全满）
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        filled: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条格子的显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();
      
      // 绘制边框
      bar.graphics.lineStyle(2, 0x666666, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      // 根据当前生命值决定是否填充
      if (i < this.currentHealth) {
        bar.graphics.fillStyle(0xff0000, 1);
        bar.graphics.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
        bar.filled = true;
      } else {
        // 空血条显示暗色
        bar.graphics.fillStyle(0x333333, 1);
        bar.graphics.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
        bar.filled = false;
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新signals
    window.__signals__.health = this.currentHealth;
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.logEvent('受到伤害', this.currentHealth);
      
      // 如果生命值为0，显示游戏结束
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logEvent('自动回复', this.currentHealth);
    }
  }

  logEvent(eventType, health) {
    const timestamp = Math.floor(this.time.now / 1000);
    const event = {
      type: eventType,
      health: health,
      time: timestamp
    };
    
    window.__signals__.events.push(event);
    
    // 只显示最近的事件
    const recentEvents = window.__signals__.events.slice(-3);
    const logText = recentEvents.map(e => 
      `[${e.time}s] ${e.type} - HP: ${e.health}`
    ).join('\n');
    
    this.eventLog.setText('事件日志:\n' + logText);
    
    // 输出到控制台（JSON格式）
    console.log(JSON.stringify(event));
  }

  showGameOver() {
    // 停止回复定时器
    if (this.healTimer) {
      this.healTimer.remove();
    }
    
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 350, '生命值耗尽！', {
      fontSize: '36px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    this.logEvent('游戏结束', 0);
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