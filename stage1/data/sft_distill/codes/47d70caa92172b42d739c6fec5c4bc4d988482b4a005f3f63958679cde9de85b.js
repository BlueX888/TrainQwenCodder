class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
    
    // 可验证的信号输出
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press W/A/S/D to take damage\nAuto heal 1 HP per second', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 绘制初始血条
    this.updateHealthBar();

    // 设置键盘输入监听 - WASD 键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    keyW.on('down', () => this.takeDamage());
    keyA.on('down', () => this.takeDamage());
    keyS.on('down', () => this.takeDamage());
    keyD.on('down', () => this.takeDamage());

    // 创建自动回血定时器 - 每1秒执行一次
    this.regenTimer = this.time.addEvent({
      delay: 1000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加事件日志显示区域
    this.eventLogText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.logEvent('Game Started', this.currentHealth);
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.logEvent('Took Damage', this.currentHealth);
      
      // 输出信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.events.push({
        type: 'damage',
        health: this.currentHealth,
        timestamp: Date.now()
      });
      
      console.log(JSON.stringify({
        event: 'damage',
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    }
  }

  regenerateHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.logEvent('Regenerated', this.currentHealth);
      
      // 输出信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.events.push({
        type: 'regen',
        health: this.currentHealth,
        timestamp: Date.now()
      });
      
      console.log(JSON.stringify({
        event: 'regenerate',
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    }
  }

  updateHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    // 血条配置
    const barWidth = 60;  // 每格血条宽度
    const barHeight = 40; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 300;

    // 绘制5格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制填充（红色表示有血，灰色表示无血）
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1); // 红色
      } else {
        this.healthBarGraphics.fillStyle(0x333333, 1); // 灰色
      }
      this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }

    // 更新生命值文本
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);
  }

  logEvent(eventType, health) {
    const message = `${eventType} - HP: ${health}/${this.maxHealth}`;
    this.eventLogText.setText(message);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.eventLogText,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
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

// 初始化全局信号对象
window.__signals__ = {
  health: 5,
  maxHealth: 5,
  events: []
};