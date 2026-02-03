class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.signals = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = this.signals;

    // 创建标题文字
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文字
    this.add.text(400, 100, '按方向键扣血 | 每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值文字显示
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加按键事件监听（防止连续触发）
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage('LEFT'));
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage('RIGHT'));
    this.input.keyboard.on('keydown-UP', () => this.takeDamage('UP'));
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage('DOWN'));

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志显示区域
    this.logText = this.add.text(50, 400, '', {
      fontSize: '16px',
      color: '#ffff00',
      wordWrap: { width: 700 }
    });

    // 记录初始状态
    this.logAction('INIT', this.currentHealth);
  }

  createHealthBar() {
    const barWidth = 60;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 250;

    // 清空之前的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    // 创建8格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const graphics = this.add.graphics();

      // 绘制血条背景（灰色边框）
      graphics.lineStyle(3, 0x666666, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 存活的血条 - 红色渐变
        const hpPercent = this.currentHealth / this.maxHealth;
        let color = 0xff0000; // 红色
        if (hpPercent > 0.5) {
          color = 0x00ff00; // 绿色
        } else if (hpPercent > 0.25) {
          color = 0xffff00; // 黄色
        }
        graphics.fillStyle(color, 1);
      } else {
        // 失去的血条 - 深灰色
        graphics.fillStyle(0x333333, 1);
      }

      graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push(graphics);
    }
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthDisplay();
      this.logAction('DAMAGE', this.currentHealth, `按下${key}键`);
      
      // 添加屏幕震动效果
      this.cameras.main.shake(100, 0.005);
    } else {
      this.logAction('DEAD', 0, '生命值已为0');
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthDisplay();
      this.logAction('HEAL', this.currentHealth, '自动回复');
      
      // 添加闪烁效果
      this.cameras.main.flash(200, 0, 255, 0);
    }
  }

  updateHealthDisplay() {
    // 更新文字显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文字颜色
    if (this.currentHealth > 5) {
      this.healthText.setColor('#00ff00');
    } else if (this.currentHealth > 2) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }

    // 重新绘制血条
    this.createHealthBar();
  }

  logAction(action, health, detail = '') {
    const timestamp = this.time.now;
    const signal = {
      timestamp,
      action,
      health,
      detail
    };

    this.signals.push(signal);

    // 更新日志显示（只显示最近5条）
    const recentLogs = this.signals.slice(-5).map(s => 
      `[${s.action}] HP:${s.health} ${s.detail}`
    ).join('\n');
    this.logText.setText(recentLogs);

    // 输出到控制台
    console.log(JSON.stringify(signal));
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
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