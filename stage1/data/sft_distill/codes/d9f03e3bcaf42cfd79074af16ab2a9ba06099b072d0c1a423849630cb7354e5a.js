class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      clickCount: 0,
      healCount: 0
    };

    // 创建标题文本
    this.add.text(400, 100, '生命值系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '点击鼠标左键扣血，每秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatusText();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
        window.__signals__.clickCount++;
        console.log(JSON.stringify({
          event: 'damage',
          health: this.currentHealth,
          timestamp: Date.now()
        }));
      }
    });

    // 创建自动回血定时器（每1秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 1000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建调试日志定时器
    this.time.addEvent({
      delay: 500,
      callback: () => {
        window.__signals__.health = this.currentHealth;
      },
      loop: true
    });
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 50;
    const blockHeight = 40;
    const gap = 5;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      
      // 创建血格背景（灰色边框）
      const bg = this.add.graphics();
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, startY, blockWidth, blockHeight);

      // 创建血格填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, startY + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        bg: bg,
        fill: fill,
        active: true
      });
    }
  }

  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      
      if (i < this.currentHealth) {
        // 有生命值：显示红色
        block.fill.clear();
        block.fill.fillStyle(0xff0000, 1);
        const x = 200 + i * 55;
        block.fill.fillRect(x + 2, 252, 46, 36);
        block.active = true;
      } else {
        // 无生命值：显示深灰色
        block.fill.clear();
        block.fill.fillStyle(0x333333, 1);
        const x = 200 + i * 55;
        block.fill.fillRect(x + 2, 252, 46, 36);
        block.active = false;
      }
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateStatusText();
      
      if (this.currentHealth === 0) {
        this.showMessage('生命值已耗尽！', 0xff0000);
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateStatusText();
      window.__signals__.healCount++;
      
      console.log(JSON.stringify({
        event: 'heal',
        health: this.currentHealth,
        timestamp: Date.now()
      }));

      if (this.currentHealth === this.maxHealth) {
        this.showMessage('生命值已满！', 0x00ff00);
      }
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `当前生命值: ${this.currentHealth}/${this.maxHealth}\n` +
      `点击次数: ${window.__signals__.clickCount} | 回复次数: ${window.__signals__.healCount}`
    );
  }

  showMessage(text, color) {
    // 创建临时消息文本
    const message = this.add.text(400, 350, text, {
      fontSize: '24px',
      color: '#' + color.toString(16).padStart(6, '0'),
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 1.5秒后淡出并销毁
    this.tweens.add({
      targets: message,
      alpha: 0,
      duration: 500,
      delay: 1000,
      onComplete: () => {
        message.destroy();
      }
    });
  }

  update(time, delta) {
    // 持续更新信号
    window.__signals__.health = this.currentHealth;
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