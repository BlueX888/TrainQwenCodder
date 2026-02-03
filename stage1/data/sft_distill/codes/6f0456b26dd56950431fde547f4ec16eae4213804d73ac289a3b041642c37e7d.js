class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 防止连续扣血
  }

  preload() {
    // 无需预加载资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文字
    this.add.text(400, 50, 'Health System Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto Heal: +1 HP every 3 seconds', {
      fontSize: '18px',
      color: '#88ff88',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建当前生命值显示
    this.healthText = this.add.text(400, 350, `Health: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建事件日志显示
    this.eventLog = this.add.text(400, 400, '', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器（每3秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('Game Started');
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const barWidth = 40;
    const barHeight = 50;
    const spacing = 10;

    // 创建8个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建背景（灰色边框）
      const bg = this.add.graphics();
      bg.lineStyle(3, 0x666666, 1);
      bg.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({ bg, fill, x, y: startY });
    }
  }

  updateHealthBar() {
    // 更新每个血条的显示状态
    this.healthBars.forEach((bar, index) => {
      bar.fill.clear();
      
      if (index < this.currentHealth) {
        // 有生命值：显示红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 2, bar.y + 2, 36, 46);
      } else {
        // 无生命值：显示暗红色
        bar.fill.fillStyle(0x440000, 0.3);
        bar.fill.fillRect(bar.x + 2, bar.y + 2, 36, 46);
      }
    });

    // 更新文字显示
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);

    // 更新信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.logEvent('Damage Taken', { health: this.currentHealth });

      // 创建伤害提示动画
      const damageText = this.add.text(400, 200, '-1', {
        fontSize: '32px',
        color: '#ff0000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: damageText,
        y: 150,
        alpha: 0,
        duration: 1000,
        onComplete: () => damageText.destroy()
      });

      if (this.currentHealth === 0) {
        this.logEvent('Player Died');
        this.showGameOver();
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth++;
      this.updateHealthBar();
      this.logEvent('Auto Heal', { health: this.currentHealth });

      // 创建回血提示动画
      const healText = this.add.text(400, 200, '+1', {
        fontSize: '32px',
        color: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: healText,
        y: 150,
        alpha: 0,
        duration: 1000,
        onComplete: () => healText.destroy()
      });
    }
  }

  showGameOver() {
    // 停止自动回血
    this.healTimer.remove();

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  logEvent(eventName, data = {}) {
    const event = {
      time: Date.now(),
      event: eventName,
      ...data
    };
    
    window.__signals__.events.push(event);
    
    // 显示最后一个事件
    this.eventLog.setText(`Last Event: ${eventName}`);
    
    // 输出到控制台
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 检测方向键输入（带防抖）
    if (time - this.lastKeyPressTime > this.keyPressDelay) {
      if (this.cursors.left.isDown || 
          this.cursors.right.isDown || 
          this.cursors.up.isDown || 
          this.cursors.down.isDown) {
        
        this.takeDamage();
        this.lastKeyPressTime = time;
      }
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