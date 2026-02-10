class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healTimer = null;
    this.lastDamageKeys = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      lastAction: 'init'
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'Auto heal 1 HP every 1.5 seconds', {
      fontSize: '20px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 监听 WASD 键
    this.input.keyboard.on('keydown-W', () => this.takeDamage('W'));
    this.input.keyboard.on('keydown-A', () => this.takeDamage('A'));
    this.input.keyboard.on('keydown-S', () => this.takeDamage('S'));
    this.input.keyboard.on('keydown-D', () => this.takeDamage('D'));

    // 创建自动回血定时器（每 1.5 秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 输出初始状态
    this.logStatus('Game started');
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 60;
    const barHeight = 40;
    const barGap = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2;
    const startY = 250;

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      
      // 边框
      this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 填充颜色（红色表示有血，灰色表示无血）
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }

    // 显示数值
    if (this.healthText) {
      this.healthText.destroy();
    }
    this.healthText = this.add.text(400, 320, `HP: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.lastDamageKeys.push(key);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;
      window.__signals__.lastAction = `damage_${key}`;

      this.drawHealthBar();
      this.logStatus(`Took damage from key ${key}`);

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.statusText.setText('DEAD! No more healing...');
        this.statusText.setColor('#ff0000');
        this.healTimer.paused = true;
        this.logStatus('Player died');
      }
    }
  }

  autoHeal() {
    // 只有未死亡且未满血时才回血
    if (this.currentHealth > 0 && this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      window.__signals__.lastAction = 'heal';

      this.drawHealthBar();
      this.logStatus('Auto healed +1 HP');
    }
  }

  logStatus(message) {
    const timestamp = this.time.now;
    const logData = {
      time: timestamp,
      message: message,
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: window.__signals__.damageCount,
      healCount: window.__signals__.healCount
    };
    
    console.log('[HealthBar]', JSON.stringify(logData));
    
    this.statusText.setText(message);
    this.statusText.setColor('#ffff00');
  }

  update(time, delta) {
    // 可以在这里添加额外的每帧更新逻辑
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