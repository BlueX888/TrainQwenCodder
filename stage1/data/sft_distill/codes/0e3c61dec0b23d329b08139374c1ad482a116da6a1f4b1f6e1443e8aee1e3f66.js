// 初始化全局信号对象
window.__signals__ = {
  health: 5,
  maxHealth: 5,
  events: []
};

class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.currentHealth = 5;
    this.maxHealth = 5;
    this.healthBars = [];
    this.lastDamageTime = 0;
    this.damageDelay = 200; // 防止连续扣血，200ms延迟
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '生命值系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '按 W/A/S/D 键扣血 | 每秒自动回复1点', {
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
    this.eventLog = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听WASD键盘输入
    this.input.keyboard.on('keydown-W', () => this.takeDamage());
    this.input.keyboard.on('keydown-A', () => this.takeDamage());
    this.input.keyboard.on('keydown-S', () => this.takeDamage());
    this.input.keyboard.on('keydown-D', () => this.takeDamage());

    // 创建每秒回血的定时器
    this.healTimer = this.time.addEvent({
      delay: 1000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('游戏开始', this.currentHealth);
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (barWidth * 5 + barSpacing * 4) / 2;
    const startY = 200;

    // 创建5个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 背景（空血条）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, startY, barWidth, barHeight);
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 前景（满血条）
      const foreground = this.add.graphics();
      foreground.fillStyle(0x00ff00, 1);
      foreground.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background,
        foreground,
        x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条的显示
    this.healthBars.forEach((bar, index) => {
      bar.foreground.clear();
      
      if (index < this.currentHealth) {
        // 根据生命值显示不同颜色
        let color = 0x00ff00; // 绿色（健康）
        if (this.currentHealth <= 2) {
          color = 0xff0000; // 红色（危险）
        } else if (this.currentHealth <= 3) {
          color = 0xff9900; // 橙色（警告）
        }
        
        bar.foreground.fillStyle(color, 1);
        bar.foreground.fillRect(
          bar.x + 2,
          bar.y + 2,
          bar.width - 4,
          bar.height - 4
        );
      }
    });

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);

    // 更新全局信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage() {
    const currentTime = this.time.now;
    
    // 防止连续扣血
    if (currentTime - this.lastDamageTime < this.damageDelay) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.lastDamageTime = currentTime;
      this.updateHealthBar();
      this.logEvent('受到伤害', this.currentHealth);

      // 添加屏幕震动效果
      this.cameras.main.shake(100, 0.005);

      if (this.currentHealth === 0) {
        this.logEvent('生命值归零', 0);
        this.eventLog.setColor('#ff0000');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.logEvent('自动回复', this.currentHealth);
      this.eventLog.setColor('#00ff00');

      // 添加恢复特效
      this.tweens.add({
        targets: this.healthText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      });
    }
  }

  logEvent(eventType, healthValue) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      time: timestamp,
      event: eventType,
      health: healthValue
    };

    // 添加到全局信号
    window.__signals__.events.push(logEntry);

    // 更新屏幕显示
    this.eventLog.setText(`[${timestamp}] ${eventType} - 生命值: ${healthValue}`);

    // 输出到控制台
    console.log(JSON.stringify(logEntry));
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

// Phaser3 游戏配置
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