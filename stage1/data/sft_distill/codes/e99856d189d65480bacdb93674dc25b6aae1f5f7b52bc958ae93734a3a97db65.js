class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBlocks = [];
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      lastAction: 'initialized',
      timestamp: Date.now()
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Right Click to take damage | Auto heal every 3 seconds', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 500, `Health: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志显示区域
    this.logText = this.add.text(400, 550, '', {
      fontSize: '14px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.log('System initialized');
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const spacing = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + spacing)) / 2;
    const startY = 200;

    // 创建12个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + spacing);
      const y = startY;

      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量方块（红色填充）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff0000, 1);
      healthBlock.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: background,
        fill: healthBlock,
        active: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      if (i < this.currentHealth) {
        // 显示血量
        block.fill.setAlpha(1);
        block.active = true;
      } else {
        // 隐藏血量
        block.fill.setAlpha(0);
        block.active = false;
      }
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);

    // 更新验证信号
    window.__signals__.health = this.currentHealth;
    window.__signals__.timestamp = Date.now();
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.log(`Took ${amount} damage! Health: ${this.currentHealth}`);
      
      window.__signals__.lastAction = 'damage';
      
      console.log(JSON.stringify({
        action: 'takeDamage',
        amount: amount,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      }));
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.log(`Auto healed! Health: ${this.currentHealth}`);
      
      window.__signals__.lastAction = 'heal';
      
      console.log(JSON.stringify({
        action: 'autoHeal',
        amount: 1,
        currentHealth: this.currentHealth,
        timestamp: Date.now()
      }));
    }
  }

  log(message) {
    this.logText.setText(message);
    console.log(`[HealthBar] ${message}`);
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