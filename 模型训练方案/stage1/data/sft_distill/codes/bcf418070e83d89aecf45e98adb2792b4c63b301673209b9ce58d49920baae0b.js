// 初始化全局信号记录
window.__signals__ = {
  health: 12,
  maxHealth: 12,
  events: []
};

class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12;
    this.maxHealth = 12;
    this.healthBlocks = [];
    this.blockWidth = 40;
    this.blockHeight = 50;
    this.blockSpacing = 5;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题文字
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '鼠标右键：扣血 | 自动回血：每2.5秒+1', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    const startX = 400 - (this.maxHealth * (this.blockWidth + this.blockSpacing)) / 2;
    const startY = 200;

    // 创建12格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (this.blockWidth + this.blockSpacing);
      const block = this.add.graphics();
      
      // 绘制边框
      block.lineStyle(2, 0xffffff, 1);
      block.strokeRect(x, startY, this.blockWidth, this.blockHeight);
      
      // 绘制填充（初始为满血）
      block.fillStyle(0x00ff00, 1);
      block.fillRect(x + 2, startY + 2, this.blockWidth - 4, this.blockHeight - 4);
      
      this.healthBlocks.push({
        graphics: block,
        x: x,
        y: startY,
        filled: true
      });
    }

    // 创建生命值文字显示
    this.healthText = this.add.text(400, 280, `生命值: ${this.health} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建事件日志显示
    this.eventLog = this.add.text(400, 350, '事件日志:', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5, 0);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每2.5秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('游戏开始', this.health);
  }

  takeDamage(amount) {
    if (this.health > 0) {
      this.health = Math.max(0, this.health - amount);
      this.updateHealthBar();
      this.logEvent('受到伤害', this.health);
      
      // 更新全局信号
      window.__signals__.health = this.health;
      window.__signals__.events.push({
        type: 'damage',
        amount: amount,
        currentHealth: this.health,
        timestamp: Date.now()
      });
    }
  }

  autoHeal() {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.updateHealthBar();
      this.logEvent('自动回血', this.health);
      
      // 更新全局信号
      window.__signals__.health = this.health;
      window.__signals__.events.push({
        type: 'heal',
        amount: 1,
        currentHealth: this.health,
        timestamp: Date.now()
      });
    }
  }

  updateHealthBar() {
    // 更新每格血条的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.graphics.clear();
      
      // 绘制边框
      block.graphics.lineStyle(2, 0xffffff, 1);
      block.graphics.strokeRect(block.x, block.y, this.blockWidth, this.blockHeight);
      
      // 根据当前生命值绘制填充
      if (i < this.health) {
        // 有生命值：绿色
        block.graphics.fillStyle(0x00ff00, 1);
        block.graphics.fillRect(
          block.x + 2, 
          block.y + 2, 
          this.blockWidth - 4, 
          this.blockHeight - 4
        );
        block.filled = true;
      } else {
        // 无生命值：红色（表示已损失）
        block.graphics.fillStyle(0xff0000, 0.3);
        block.graphics.fillRect(
          block.x + 2, 
          block.y + 2, 
          this.blockWidth - 4, 
          this.blockHeight - 4
        );
        block.filled = false;
      }
    }
    
    // 更新文字显示
    this.healthText.setText(`生命值: ${this.health} / ${this.maxHealth}`);
    
    // 根据生命值改变文字颜色
    if (this.health <= 3) {
      this.healthText.setColor('#ff0000');
    } else if (this.health <= 6) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#ffffff');
    }
  }

  logEvent(eventType, currentHealth) {
    const timestamp = new Date().toLocaleTimeString();
    const logText = `[${timestamp}] ${eventType} - 当前生命值: ${currentHealth}`;
    
    this.eventLog.setText(`事件日志:\n${logText}`);
    
    // 输出到控制台
    console.log(JSON.stringify({
      timestamp: timestamp,
      event: eventType,
      health: currentHealth,
      maxHealth: this.maxHealth
    }));
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