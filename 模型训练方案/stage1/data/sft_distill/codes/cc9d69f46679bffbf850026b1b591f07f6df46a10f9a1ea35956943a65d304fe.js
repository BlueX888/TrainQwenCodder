class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healTimer = null;
    this.keyPressed = {}; // 防止按键重复触发
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

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入
    this.setupKeyboardInput();

    // 创建自动回血定时器（每1.5秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加说明文字
    this.add.text(400, 500, 'Press W/A/S/D to take damage\nAuto heal: 1 HP every 1.5s', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加当前血量文字显示
    this.healthText = this.add.text(400, 250, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.logEvent('game_start', { health: this.currentHealth });
  }

  createHealthBar() {
    const barWidth = 60;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - ((barWidth + barSpacing) * this.maxHealth - barSpacing) / 2;
    const startY = 200;

    this.healthBarGraphics = this.add.graphics();
    this.updateHealthBar(startX, startY, barWidth, barHeight, barSpacing);
  }

  updateHealthBar(startX, startY, barWidth, barHeight, barSpacing) {
    this.healthBarGraphics.clear();

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);

      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 填充颜色（红色=有血，灰色=无血）
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1); // 红色
      } else {
        this.healthBarGraphics.fillStyle(0x555555, 1); // 灰色
      }
      this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
  }

  setupKeyboardInput() {
    // 创建WASD键
    const keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    Object.keys(keys).forEach(keyName => {
      keys[keyName].on('down', () => {
        if (!this.keyPressed[keyName]) {
          this.keyPressed[keyName] = true;
          this.takeDamage(keyName);
        }
      });

      keys[keyName].on('up', () => {
        this.keyPressed[keyName] = false;
      });
    });
  }

  takeDamage(keyName) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar(
        400 - ((60 + 10) * this.maxHealth - 10) / 2,
        200,
        60,
        30,
        10
      );
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
      
      this.logEvent('take_damage', {
        key: keyName,
        health: this.currentHealth,
        timestamp: Date.now()
      });

      if (this.currentHealth === 0) {
        this.logEvent('health_depleted', { health: 0 });
      }
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar(
        400 - ((60 + 10) * this.maxHealth - 10) / 2,
        200,
        60,
        30,
        10
      );
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
      
      this.logEvent('auto_heal', {
        health: this.currentHealth,
        timestamp: Date.now()
      });
    }
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      ...data,
      time: this.time.now
    };
    
    window.__signals__.health = this.currentHealth;
    window.__signals__.events.push(event);
    
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
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