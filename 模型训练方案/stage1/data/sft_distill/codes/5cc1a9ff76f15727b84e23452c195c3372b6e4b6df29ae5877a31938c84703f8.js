class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthGraphics = null;
    this.healTimer = null;
    this.statusText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建血条Graphics对象
    this.healthGraphics = this.add.graphics();
    
    // 创建状态文本
    this.statusText = this.add.text(50, 150, '', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // 初始绘制血条
    this.drawHealthBar();
    
    // 添加键盘监听 - WASD键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // 为每个键绑定扣血事件
    keyW.on('down', () => this.takeDamage());
    keyA.on('down', () => this.takeDamage());
    keyS.on('down', () => this.takeDamage());
    keyD.on('down', () => this.takeDamage());
    
    // 创建自动回血定时器 - 每1.5秒触发一次
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });
    
    // 添加提示文本
    this.add.text(50, 200, 'Press W/A/S/D to take damage', {
      fontSize: '16px',
      color: '#cccccc'
    });
    
    this.add.text(50, 230, 'Auto heal 1 HP every 1.5s', {
      fontSize: '16px',
      color: '#cccccc'
    });
  }

  // 绘制血条
  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();
    
    const startX = 50;
    const startY = 50;
    const barWidth = 80;
    const barHeight = 30;
    const spacing = 10;
    
    // 绘制3个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 绘制边框
      this.healthGraphics.lineStyle(3, 0x333333, 1);
      this.healthGraphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 根据当前血量填充颜色
      if (i < this.currentHealth) {
        // 有血 - 红色
        this.healthGraphics.fillStyle(0xff0000, 1);
      } else {
        // 无血 - 灰色
        this.healthGraphics.fillStyle(0x444444, 1);
      }
      this.healthGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
    
    // 更新状态文本
    this.updateStatusText();
  }

  // 更新状态文本
  updateStatusText() {
    this.statusText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
  }

  // 受到伤害
  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.drawHealthBar();
      console.log(`Took damage! Current health: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        console.log('Health depleted!');
      }
    }
  }

  // 回复生命值
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.drawHealthBar();
      console.log(`Healed! Current health: ${this.currentHealth}`);
    }
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证变量（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, HealthBarScene };
}