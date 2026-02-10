class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      lastAction: 'init',
      timestamp: Date.now()
    };

    // 创建标题文本
    this.add.text(400, 50, '生命值系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按空格键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条背景和容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建生命值数字显示
    this.healthText = this.add.text(400, 250, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });

    // 创建回血定时器（每4秒触发一次）
    this.regenTimer = this.time.addEvent({
      delay: 4000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 创建日志文本区域
    this.logText = this.add.text(400, 350, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 显示初始日志
    this.updateLog('游戏开始，生命值满格');
  }

  drawHealthBar() {
    const barWidth = 30;  // 每格宽度
    const barHeight = 40; // 每格高度
    const gap = 5;        // 格子间隙
    const startX = 400 - (this.maxHealth * (barWidth + gap)) / 2; // 居中起始位置
    const startY = 150;

    this.healthBarGraphics.clear();

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 当前生命值 - 绿色
        this.healthBarGraphics.fillStyle(0x00ff00, 1);
      } else {
        // 已损失生命值 - 深红色
        this.healthBarGraphics.fillStyle(0x660000, 0.5);
      }
      this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthDisplay();
      this.updateLog(`受到伤害！生命值: ${this.currentHealth}/${this.maxHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.lastAction = 'damage';
      window.__signals__.timestamp = Date.now();
      
      console.log(JSON.stringify({
        action: 'damage',
        health: this.currentHealth,
        maxHealth: this.maxHealth,
        time: new Date().toISOString()
      }));

      if (this.currentHealth === 0) {
        this.updateLog('生命值归零！');
      }
    }
  }

  regenerateHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthDisplay();
      this.updateLog(`自动回复！生命值: ${this.currentHealth}/${this.maxHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.lastAction = 'regen';
      window.__signals__.timestamp = Date.now();
      
      console.log(JSON.stringify({
        action: 'regenerate',
        health: this.currentHealth,
        maxHealth: this.maxHealth,
        time: new Date().toISOString()
      }));
    }
  }

  updateHealthDisplay() {
    this.drawHealthBar();
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  updateLog(message) {
    this.logText.setText(message);
    
    // 1.5秒后淡出日志
    this.tweens.add({
      targets: this.logText,
      alpha: 0,
      duration: 500,
      delay: 1500,
      onComplete: () => {
        this.logText.setAlpha(1);
      }
    });
  }

  update(time, delta) {
    // 持续更新信号时间戳
    if (window.__signals__) {
      window.__signals__.currentTime = time;
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