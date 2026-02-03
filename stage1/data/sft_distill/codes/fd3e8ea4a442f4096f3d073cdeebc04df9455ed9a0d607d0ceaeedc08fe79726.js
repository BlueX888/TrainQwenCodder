class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBlocks = [];
    this.healTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      events: []
    };

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '鼠标右键：扣血 | 每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建状态显示文本
    this.healthText = this.add.text(400, 450, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.updateHealthText();

    // 添加提示文本
    this.add.text(400, 500, '当前血量会显示在下方', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    console.log('[CREATE] Health bar initialized', {
      health: this.currentHealth,
      maxHealth: this.maxHealth
    });
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 40;
    const blockHeight = 30;
    const gap = 5;

    // 清空旧的血条
    this.healthBlocks.forEach(block => block.destroy());
    this.healthBlocks = [];

    // 创建12个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建背景（灰色边框）
      const bg = this.add.graphics();
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量方块（绿色或红色）
      const block = this.add.graphics();
      this.healthBlocks.push(block);

      // 添加编号文本
      this.add.text(x + blockWidth / 2, y + blockHeight / 2, (i + 1).toString(), {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 40;
    const blockHeight = 30;
    const gap = 5;

    // 更新每个血条方块的颜色
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      block.clear();

      if (i < this.currentHealth) {
        // 当前生命值：绿色
        block.fillStyle(0x00ff00, 1);
        block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);
      } else {
        // 已损失生命值：红色
        block.fillStyle(0xff0000, 0.3);
        block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);
      }
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();

      const event = {
        type: 'damage',
        amount: amount,
        health: this.currentHealth,
        timestamp: Date.now()
      };

      window.__signals__.health = this.currentHealth;
      window.__signals__.events.push(event);

      console.log('[DAMAGE]', JSON.stringify(event));

      if (this.currentHealth === 0) {
        console.log('[DEATH] Player health reached 0');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();

      const event = {
        type: 'heal',
        amount: 1,
        health: this.currentHealth,
        timestamp: Date.now()
      };

      window.__signals__.health = this.currentHealth;
      window.__signals__.events.push(event);

      console.log('[HEAL]', JSON.stringify(event));
    }
  }

  updateHealthText() {
    this.healthText.setText(`当前生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  update(time, delta) {
    // 每帧更新（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

const game = new Phaser.Game(config);