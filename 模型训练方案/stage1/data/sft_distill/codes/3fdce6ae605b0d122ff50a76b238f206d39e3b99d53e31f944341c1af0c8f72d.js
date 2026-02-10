class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 150, '按空格键扣血 | 每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建状态文本
    this.healthText = this.add.text(400, 400, `当前生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每2秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('game_start', { health: this.currentHealth });
  }

  createHealthBar() {
    const startX = 250;
    const startY = 250;
    const barWidth = 80;
    const barHeight = 30;
    const spacing = 10;

    // 创建3个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制填充（初始为满血，红色）
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      
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
    for (let i = 0; i < this.healthBars.length; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();
      
      // 绘制边框
      bar.graphics.lineStyle(3, 0xffffff, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      // 根据当前生命值决定填充颜色
      if (i < this.currentHealth) {
        // 有血：红色
        bar.graphics.fillStyle(0xff0000, 1);
        bar.filled = true;
      } else {
        // 无血：深灰色
        bar.graphics.fillStyle(0x333333, 1);
        bar.filled = false;
      }
      
      bar.graphics.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      this.logEvent('take_damage', { 
        damage: amount, 
        health: this.currentHealth 
      });

      // 受伤闪烁效果
      this.cameras.main.shake(100, 0.005);

      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      this.logEvent('auto_heal', { 
        heal: 1, 
        health: this.currentHealth 
      });

      // 回血闪光效果
      this.cameras.main.flash(200, 0, 255, 0);
    }
  }

  updateHealthText() {
    this.healthText.setText(`当前生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新全局信号
    window.__signals__.health = this.currentHealth;
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 500, '生命值耗尽！', {
      fontSize: '28px',
      color: '#ff0000'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.logEvent('game_over', { health: 0 });
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 本例中主要逻辑在事件驱动，update 中无需额外处理
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