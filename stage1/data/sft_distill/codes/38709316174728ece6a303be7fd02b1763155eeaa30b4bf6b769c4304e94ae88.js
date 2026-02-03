class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthGraphics = null;
    this.healTimer = null;
    this.lastDamageTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化signals对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      logs: []
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto heal 1 HP every 2.5 seconds', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 设置自动回血定时器 (2.5秒 = 2500毫秒)
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    this.logStatus('Game started');
  }

  setupInput() {
    // 监听WASD键
    const keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 为每个键添加按下事件
    Object.keys(keys).forEach(key => {
      keys[key].on('down', () => {
        this.takeDamage();
      });
    });
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;
      
      this.drawHealthBar();
      this.logStatus(`Took damage! Health: ${this.currentHealth}/${this.maxHealth}`);
      
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth++;
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      
      this.drawHealthBar();
      this.logStatus(`Auto healed! Health: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();

    const heartSize = 60;
    const heartSpacing = 80;
    const startX = 400 - (this.maxHealth - 1) * heartSpacing / 2;
    const startY = 250;

    // 绘制每个心形
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * heartSpacing;
      const y = startY;
      
      if (i < this.currentHealth) {
        // 满血心形 - 红色
        this.drawHeart(x, y, heartSize, 0xff0000, 1);
      } else {
        // 空血心形 - 灰色轮廓
        this.drawHeart(x, y, heartSize, 0x666666, 0.3);
      }
    }

    // 绘制血量文本
    this.healthGraphics.fillStyle(0xffffff, 1);
    const healthText = `${this.currentHealth} / ${this.maxHealth}`;
    // 使用文本对象而不是graphics绘制文本
    if (this.healthText) {
      this.healthText.destroy();
    }
    this.healthText = this.add.text(400, startY + 80, healthText, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  drawHeart(x, y, size, color, alpha) {
    this.healthGraphics.fillStyle(color, alpha);
    
    // 简化的心形绘制（使用圆形和三角形组合）
    const scale = size / 60;
    
    // 绘制两个圆形（心形上部）
    this.healthGraphics.fillCircle(x - 15 * scale, y - 5 * scale, 18 * scale);
    this.healthGraphics.fillCircle(x + 15 * scale, y - 5 * scale, 18 * scale);
    
    // 绘制三角形（心形下部）
    this.healthGraphics.beginPath();
    this.healthGraphics.moveTo(x - 30 * scale, y);
    this.healthGraphics.lineTo(x, y + 35 * scale);
    this.healthGraphics.lineTo(x + 30 * scale, y);
    this.healthGraphics.closePath();
    this.healthGraphics.fillPath();

    // 绘制轮廓
    if (alpha < 1) {
      this.healthGraphics.lineStyle(3, color, 1);
      this.healthGraphics.strokeCircle(x - 15 * scale, y - 5 * scale, 18 * scale);
      this.healthGraphics.strokeCircle(x + 15 * scale, y - 5 * scale, 18 * scale);
    }
  }

  showGameOver() {
    this.statusText.setText('GAME OVER! Health depleted!');
    this.statusText.setColor('#ff0000');
    this.statusText.setFontSize('28px');
    this.logStatus('Game Over - Health depleted');
  }

  logStatus(message) {
    const timestamp = this.time.now;
    const logEntry = {
      time: timestamp,
      message: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth
    };
    
    window.__signals__.logs.push(logEntry);
    console.log(JSON.stringify(logEntry));
    
    // 更新状态文本（非Game Over状态）
    if (this.currentHealth > 0) {
      this.statusText.setText(message);
      this.statusText.setColor('#ffff00');
      this.statusText.setFontSize('18px');
    }
  }

  update(time, delta) {
    // 更新signals中的定时器信息
    if (this.healTimer) {
      window.__signals__.nextHealIn = Math.max(0, this.healTimer.getRemaining()).toFixed(0);
      window.__signals__.healProgress = this.healTimer.getProgress().toFixed(2);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

new Phaser.Game(config);