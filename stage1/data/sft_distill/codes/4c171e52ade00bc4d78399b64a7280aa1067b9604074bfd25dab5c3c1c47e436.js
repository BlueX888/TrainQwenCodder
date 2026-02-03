class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.hearts = [];
    this.healTimer = null;
    this.canTakeDamage = true;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health System Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto heal 1 HP every 0.5 seconds', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建状态显示文本
    this.healthText = this.add.text(400, 350, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.updateHealthText();

    // 创建事件日志文本
    this.logText = this.add.text(400, 400, '', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupKeyboardInput();

    // 设置自动回血定时器
    this.setupHealTimer();

    this.logEvent('Game started with 3 HP');
  }

  createHealthBar() {
    const startX = 250;
    const startY = 200;
    const heartSize = 60;
    const spacing = 80;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * spacing;
      const y = startY;

      // 创建心形容器
      const heartContainer = this.add.container(x, y);

      // 绘制心形背景（灰色）
      const bgHeart = this.add.graphics();
      this.drawHeart(bgHeart, 0, 0, heartSize, 0x333333);

      // 绘制心形前景（红色）
      const fgHeart = this.add.graphics();
      this.drawHeart(fgHeart, 0, 0, heartSize, 0xff0000);

      heartContainer.add([bgHeart, fgHeart]);

      this.hearts.push({
        container: heartContainer,
        foreground: fgHeart
      });
    }
  }

  drawHeart(graphics, x, y, size, color) {
    graphics.fillStyle(color, 1);
    graphics.lineStyle(2, 0x000000, 1);

    // 简化的心形（使用圆形和三角形组合）
    const scale = size / 60;
    
    // 左半圆
    graphics.fillCircle(x - 15 * scale, y - 10 * scale, 15 * scale);
    // 右半圆
    graphics.fillCircle(x + 15 * scale, y - 10 * scale, 15 * scale);
    
    // 下方三角形
    graphics.beginPath();
    graphics.moveTo(x - 30 * scale, y - 5 * scale);
    graphics.lineTo(x, y + 25 * scale);
    graphics.lineTo(x + 30 * scale, y - 5 * scale);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  setupKeyboardInput() {
    // 监听WASD键
    const keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 为每个键添加按下事件
    Object.keys(keys).forEach(keyName => {
      keys[keyName].on('down', () => {
        this.takeDamage(keyName);
      });
    });
  }

  setupHealTimer() {
    // 每0.5秒触发一次回血
    this.healTimer = this.time.addEvent({
      delay: 500,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });
  }

  takeDamage(key) {
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateHealthText();

    // 更新信号
    window.__signals__.health = this.currentHealth;
    window.__signals__.damageCount++;
    
    this.logEvent(`Took damage from key ${key} (HP: ${this.currentHealth}/${this.maxHealth})`);

    // 添加受伤闪烁效果
    this.flashHearts();

    // 检查死亡
    if (this.currentHealth <= 0) {
      this.onDeath();
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth++;
      this.updateHealthBar();
      this.updateHealthText();

      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      
      this.logEvent(`Healed 1 HP (HP: ${this.currentHealth}/${this.maxHealth})`);

      // 添加治疗效果
      this.pulseHearts();
    }
  }

  updateHealthBar() {
    this.hearts.forEach((heart, index) => {
      if (index < this.currentHealth) {
        // 显示红色心形
        heart.foreground.setAlpha(1);
      } else {
        // 隐藏红色心形，只显示灰色背景
        heart.foreground.setAlpha(0);
      }
    });
  }

  updateHealthText() {
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.currentHealth <= 1) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 2) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  flashHearts() {
    // 受伤闪烁效果
    this.hearts.forEach(heart => {
      this.tweens.add({
        targets: heart.container,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 1
      });
    });
  }

  pulseHearts() {
    // 治疗脉冲效果
    const activeHeartIndex = this.currentHealth - 1;
    if (activeHeartIndex >= 0 && activeHeartIndex < this.hearts.length) {
      this.tweens.add({
        targets: this.hearts[activeHeartIndex].container,
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }

  onDeath() {
    this.canTakeDamage = false;
    this.healTimer.remove();
    
    this.logEvent('Player died! Restarting in 2 seconds...');

    // 显示死亡文本
    const deathText = this.add.text(400, 250, 'YOU DIED!', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: deathText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // 2秒后重启
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  logEvent(message) {
    const timestamp = this.time.now;
    const logEntry = { time: timestamp, message: message };
    
    window.__signals__.events.push(logEntry);
    
    // 只显示最后3条日志
    const recentEvents = window.__signals__.events.slice(-3);
    this.logText.setText(recentEvents.map(e => e.message).join('\n'));

    // 控制台输出JSON格式
    console.log(JSON.stringify(logEntry));
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