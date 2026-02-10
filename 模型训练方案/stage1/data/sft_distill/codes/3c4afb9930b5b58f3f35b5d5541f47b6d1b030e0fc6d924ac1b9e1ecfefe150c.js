class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBarGraphics = null;
    this.healTimer = null;
    
    // 初始化信号对象
    if (!window.__signals__) {
      window.__signals__ = {};
    }
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建操作提示
    this.add.text(400, 150, '按空格键扣血 | 每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条Graphics对象
    this.healthBarGraphics = this.add.graphics();
    this.updateHealthBar();

    // 创建当前生命值文本显示
    this.healthText = this.add.text(400, 350, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.updateHealthText();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每2秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志文本
    this.logText = this.add.text(400, 450, '事件日志:', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 初始化信号
    this.updateSignals();
    
    console.log('游戏初始化完成 - 当前生命值:', this.currentHealth);
  }

  updateHealthBar() {
    // 清空之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 80;
    const barHeight = 40;
    const spacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + spacing) - spacing) / 2;
    const startY = 250;

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 有生命值 - 红色填充
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 无生命值 - 暗灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  updateHealthText() {
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateSignals();
      
      const logMsg = `[${this.getTimeStamp()}] 受到伤害 -${amount}，当前生命值: ${this.currentHealth}`;
      console.log(logMsg);
      this.logText.setText(logMsg);
      
      if (this.currentHealth === 0) {
        console.log('生命值归零！');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateSignals();
      
      const logMsg = `[${this.getTimeStamp()}] 自动回复 +1，当前生命值: ${this.currentHealth}`;
      console.log(logMsg);
      this.logText.setText(logMsg);
    }
  }

  getTimeStamp() {
    const time = this.time.now / 1000;
    return time.toFixed(1) + 's';
  }

  updateSignals() {
    // 更新可验证的状态信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      healthPercentage: (this.currentHealth / this.maxHealth * 100).toFixed(1) + '%',
      timestamp: Date.now(),
      gameTime: this.time.now
    };
  }

  update(time, delta) {
    // 每帧更新信号（可选）
    this.updateSignals();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始状态日志
console.log('=== 血条系统游戏启动 ===');
console.log('初始生命值: 3/3');
console.log('操作说明: 按空格键扣血，每2秒自动回复1点');
console.log('状态信号: window.__signals__');