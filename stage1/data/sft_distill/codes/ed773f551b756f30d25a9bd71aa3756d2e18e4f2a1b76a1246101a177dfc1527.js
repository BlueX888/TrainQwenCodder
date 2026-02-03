class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBlocks = [];
    
    // 可验证的信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      actions: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Click to lose health | Auto heal every 3s', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条
    this.createHealthBar();

    // 创建当前血量文字显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
        this.logAction('damage', 1);
      }
    });

    // 创建自动回血定时器 - 每3秒回复1点
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 初始化信号
    this.updateSignals();
  }

  createHealthBar() {
    const blockWidth = 50;
    const blockHeight = 30;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap) - gap) / 2;
    const startY = 250;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      
      // 创建血格背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, startY, blockWidth, blockHeight);
      
      // 创建血格填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, startY + 2, blockWidth - 4, blockHeight - 4);
      
      this.healthBlocks.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.currentHealth) {
        // 显示血格
        this.healthBlocks[i].fill.setAlpha(1);
        this.healthBlocks[i].active = true;
      } else {
        // 隐藏血格
        this.healthBlocks[i].fill.setAlpha(0);
        this.healthBlocks[i].active = false;
      }
    }
    
    // 更新文字显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新信号
    this.updateSignals();
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      console.log(`Took ${amount} damage. Current health: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.logAction('heal', 1);
      
      console.log(`Healed 1 point. Current health: ${this.currentHealth}`);
    }
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 350, 'GAME OVER!', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 410, 'Refresh to restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 停止回血定时器
    if (this.healTimer) {
      this.healTimer.remove();
    }

    this.logAction('gameover', 0);
  }

  logAction(type, value) {
    const action = {
      type: type,
      value: value,
      health: this.currentHealth,
      timestamp: Date.now()
    };
    
    window.__signals__.actions.push(action);
    console.log(JSON.stringify(action));
  }

  updateSignals() {
    window.__signals__.health = this.currentHealth;
    window.__signals__.maxHealth = this.maxHealth;
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

const game = new Phaser.Game(config);