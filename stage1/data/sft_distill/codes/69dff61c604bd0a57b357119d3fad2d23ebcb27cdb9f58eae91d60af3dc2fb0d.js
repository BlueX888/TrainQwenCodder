class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      clicks: 0,
      healCount: 0
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Click to take damage | Auto heal 1HP per second', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建状态日志文本
    this.logText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建自动回血定时器
    this.healTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 输出初始状态日志
    console.log(JSON.stringify({
      event: 'init',
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  createHealthBar() {
    const blockWidth = 50;
    const blockHeight = 30;
    const spacing = 10;
    const startX = 400 - (this.maxHealth * (blockWidth + spacing) - spacing) / 2;
    const startY = 300;

    // 创建8个血条方块
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
        block: healthBlock,
        active: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const healthBlock = this.healthBlocks[i];
      
      if (i < this.currentHealth) {
        // 显示血量
        if (!healthBlock.active) {
          healthBlock.block.clear();
          const blockWidth = 50;
          const blockHeight = 30;
          const spacing = 10;
          const startX = 400 - (this.maxHealth * (blockWidth + spacing) - spacing) / 2;
          const startY = 300;
          const x = startX + i * (blockWidth + spacing);
          const y = startY;
          
          healthBlock.block.fillStyle(0xff0000, 1);
          healthBlock.block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);
          healthBlock.active = true;
        }
      } else {
        // 隐藏血量
        if (healthBlock.active) {
          healthBlock.block.clear();
          healthBlock.active = false;
        }
      }
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 更新状态信号
    window.__signals__.health = this.currentHealth;
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.clicks++;
      
      this.updateHealthBar();
      this.showLog('Took 1 damage!', '#ff6666');

      // 输出日志
      console.log(JSON.stringify({
        event: 'damage',
        health: this.currentHealth,
        clicks: window.__signals__.clicks,
        timestamp: Date.now()
      }));

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.showLog('Health depleted!', '#ff0000');
        console.log(JSON.stringify({
          event: 'death',
          timestamp: Date.now()
        }));
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      window.__signals__.healCount++;
      
      this.updateHealthBar();
      this.showLog('Healed 1 HP!', '#66ff66');

      // 输出日志
      console.log(JSON.stringify({
        event: 'heal',
        health: this.currentHealth,
        healCount: window.__signals__.healCount,
        timestamp: Date.now()
      }));
    }
  }

  showLog(message, color) {
    this.logText.setText(message);
    this.logText.setColor(color);
    
    // 清除之前的定时器
    if (this.logTimer) {
      this.logTimer.remove();
    }
    
    // 2秒后清除日志文本
    this.logTimer = this.time.delayedCall(2000, () => {
      this.logText.setText('');
    });
  }

  update(time, delta) {
    // 每帧更新不需要特殊处理
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