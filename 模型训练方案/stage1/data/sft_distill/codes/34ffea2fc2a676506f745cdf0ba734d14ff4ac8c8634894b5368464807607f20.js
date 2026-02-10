// 血条回血系统
class HealthScene extends Phaser.Scene {
  constructor() {
    super('HealthScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.keys = null;
    this.healTimer = null;
    this.canTakeDamage = true; // 防止按键连续触发
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号输出
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文字
    this.add.text(400, 100, '血条系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 150, '按 W/A/S/D 键扣血 | 每2.5秒自动回复1点', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入监听
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听所有WASD键
    Object.values(this.keys).forEach(key => {
      key.on('down', () => {
        this.takeDamage();
      });
    });

    // 创建自动回血计时器（每2.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建状态显示文本
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.updateStatusText();

    // 记录初始状态
    this.logEvent('game_start', { health: this.currentHealth });
  }

  createHealthBar() {
    const startX = 250;
    const startY = 250;
    const barWidth = 80;
    const barHeight = 30;
    const spacing = 10;

    // 创建3个血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 血量填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({ background, fill, x, y: startY });
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();

      if (i < this.currentHealth) {
        // 有血：红色填充
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 2, bar.y + 2, 76, 26);
      } else {
        // 无血：深灰色填充
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 2, bar.y + 2, 76, 26);
      }
    }
  }

  takeDamage() {
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateStatusText();
    this.logEvent('take_damage', { health: this.currentHealth });

    // 防止连续触发（200ms冷却）
    this.canTakeDamage = false;
    this.time.delayedCall(200, () => {
      this.canTakeDamage = true;
    });

    // 死亡检测
    if (this.currentHealth === 0) {
      this.showGameOver();
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateStatusText();
      this.logEvent('heal', { health: this.currentHealth });

      // 显示回血提示
      const healText = this.add.text(400, 320, '+1 HP', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: healText,
        y: 280,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => healText.destroy()
      });
    }
  }

  updateStatusText() {
    const status = `当前生命值: ${this.currentHealth} / ${this.maxHealth}`;
    this.statusText.setText(status);
  }

  showGameOver() {
    // 停止回血计时器
    if (this.healTimer) {
      this.healTimer.remove();
    }

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 350, '生命值耗尽！', {
      fontSize: '28px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 390, '刷新页面重新开始', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.logEvent('game_over', { health: 0 });
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    
    window.__signals__.health = this.currentHealth;
    window.__signals__.events.push(event);
    
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 每帧更新（如需要可添加逻辑）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthScene,
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);