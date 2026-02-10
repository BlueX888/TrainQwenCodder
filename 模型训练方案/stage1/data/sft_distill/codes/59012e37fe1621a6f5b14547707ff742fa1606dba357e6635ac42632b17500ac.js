class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBlocks = [];
    
    // 暴露验证信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press SPACE to lose health | Auto heal 1 HP every 4 seconds', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每4秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('game_start', { health: this.currentHealth });
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap) - gap) / 2;
    const startY = 250;

    // 创建12个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 背景（空血槽）
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRect(x, y, blockWidth, blockHeight);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, y, blockWidth, blockHeight);

      // 前景（实际血量）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        bg: bg,
        fill: fill,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条格子的显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.fill.clear();

      if (i < this.currentHealth) {
        // 有血量的格子显示红色
        block.fill.fillStyle(0xff0000, 1);
        block.fill.fillRect(
          block.x + 2,
          block.y + 2,
          block.width - 4,
          block.height - 4
        );
      }
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 更新验证信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.logEvent('take_damage', { 
        amount: amount, 
        health: this.currentHealth 
      });

      // 如果生命值为0，显示死亡提示
      if (this.currentHealth === 0) {
        this.showDeathMessage();
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logEvent('auto_heal', { 
        amount: 1, 
        health: this.currentHealth 
      });

      // 创建回血特效
      this.createHealEffect();
    }
  }

  createHealEffect() {
    // 创建绿色闪光效果
    const flash = this.add.graphics();
    flash.fillStyle(0x00ff00, 0.5);
    flash.fillRect(0, 0, 800, 600);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });

    // 显示+1文本
    const healText = this.add.text(400, 350, '+1 HP', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: healText,
      y: 320,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        healText.destroy();
      }
    });
  }

  showDeathMessage() {
    const deathText = this.add.text(400, 350, 'NO HEALTH!', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: deathText,
      scale: 1.2,
      yoyo: true,
      duration: 500,
      repeat: -1
    });

    this.logEvent('death', { health: 0 });
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    
    window.__signals__.events.push(event);
    console.log(JSON.stringify(event));
  }

  update(time, delta) {
    // 更新验证信号的时间戳
    window.__signals__.lastUpdate = time;
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