class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
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
      lastAction: 'init',
      timestamp: Date.now()
    };

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建操作说明
    this.add.text(400, 100, '鼠标右键：扣血 | 自动回复：每3秒+1点', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建生命值文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
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
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志文本区域
    this.logText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.log('游戏开始 - 生命值已满');
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const spacing = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + spacing)) / 2;
    const startY = 250;

    // 创建12个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + spacing);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(2, 0x333333, 1);
      graphics.strokeRect(x, startY, blockWidth, blockHeight);
      
      // 绘制填充
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 2, startY + 2, blockWidth - 4, blockHeight - 4);
      
      this.healthBlocks.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: blockWidth,
        height: blockHeight,
        filled: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const shouldBeFilled = i < this.currentHealth;
      
      if (block.filled !== shouldBeFilled) {
        block.graphics.clear();
        
        // 绘制边框
        block.graphics.lineStyle(2, 0x333333, 1);
        block.graphics.strokeRect(block.x, block.y, block.width, block.height);
        
        // 绘制填充（红色或灰色）
        if (shouldBeFilled) {
          block.graphics.fillStyle(0xff0000, 1);
        } else {
          block.graphics.fillStyle(0x444444, 1);
        }
        block.graphics.fillRect(
          block.x + 2,
          block.y + 2,
          block.width - 4,
          block.height - 4
        );
        
        block.filled = shouldBeFilled;
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 3) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 6) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }

    // 更新信号
    window.__signals__.health = this.currentHealth;
    window.__signals__.timestamp = Date.now();
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      window.__signals__.lastAction = 'damage';
      this.log(`受到伤害 -${amount} | 当前生命值: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        this.log('生命值耗尽！');
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      
      window.__signals__.lastAction = 'heal';
      this.log(`自动回复 +1 | 当前生命值: ${this.currentHealth}`);
    }
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    this.logText.setText(`[${timestamp}] ${message}`);
    console.log(`[HealthBar] ${message}`, {
      health: this.currentHealth,
      maxHealth: this.maxHealth
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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