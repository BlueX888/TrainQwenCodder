class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.currentHealth = 3;
    this.maxHealth = 3;
    this.healthBars = [];
    this.canTakeDamage = true; // 防止按键连续触发
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageEvents: [],
      healEvents: []
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health System Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 150, 'Press WASD to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示
    this.createHealthBars();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 400, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 创建自动回血定时器（每0.5秒）
    this.healTimer = this.time.addEvent({
      delay: 500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建事件日志文本
    this.eventLog = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBars() {
    const barWidth = 80;
    const barHeight = 30;
    const spacing = 20;
    const startX = 400 - (barWidth * 1.5 + spacing);
    const startY = 250;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建边框
      const border = this.add.graphics();
      border.lineStyle(3, 0xffffff, 1);
      border.strokeRect(x, startY, barWidth, barHeight);

      // 创建填充（生命值）
      const fill = this.add.graphics();
      fill.fillStyle(0x00ff00, 1);
      fill.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({
        border: border,
        fill: fill,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  setupInput() {
    // 创建WASD键
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.input.keyboard.on('keydown-W', () => this.takeDamage('W'));
    this.input.keyboard.on('keydown-A', () => this.takeDamage('A'));
    this.input.keyboard.on('keydown-S', () => this.takeDamage('S'));
    this.input.keyboard.on('keydown-D', () => this.takeDamage('D'));
  }

  takeDamage(key) {
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthDisplay();
    
    // 记录扣血事件
    const damageEvent = {
      timestamp: Date.now(),
      key: key,
      healthAfter: this.currentHealth
    };
    window.__signals__.damageEvents.push(damageEvent);
    window.__signals__.health = this.currentHealth;

    // 显示事件日志
    this.eventLog.setText(`Damage! Key: ${key} | Health: ${this.currentHealth}/${this.maxHealth}`);
    this.eventLog.setColor('#ff0000');

    console.log(JSON.stringify({
      event: 'damage',
      key: key,
      currentHealth: this.currentHealth,
      maxHealth: this.maxHealth
    }));

    // 防止连续触发（0.1秒冷却）
    this.canTakeDamage = false;
    this.time.delayedCall(100, () => {
      this.canTakeDamage = true;
    });

    // 检查死亡
    if (this.currentHealth <= 0) {
      this.eventLog.setText('Health depleted!');
      this.eventLog.setColor('#ff0000');
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthDisplay();

      // 记录回血事件
      const healEvent = {
        timestamp: Date.now(),
        healthAfter: this.currentHealth
      };
      window.__signals__.healEvents.push(healEvent);
      window.__signals__.health = this.currentHealth;

      // 显示事件日志
      this.eventLog.setText(`Auto Heal! Health: ${this.currentHealth}/${this.maxHealth}`);
      this.eventLog.setColor('#00ff00');

      console.log(JSON.stringify({
        event: 'heal',
        currentHealth: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    }
  }

  updateHealthDisplay() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();

      if (i < this.currentHealth) {
        // 有生命值：绿色
        bar.fill.fillStyle(0x00ff00, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      } else {
        // 无生命值：深灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      }
    }

    // 更新文本
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 1) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 2) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
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