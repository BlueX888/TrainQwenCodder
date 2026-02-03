class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 当前生命值
    this.maxHealth = 3; // 最大生命值
    this.healthBars = []; // 存储血条图形对象
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '点击鼠标左键扣血，每秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 200, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建3个血条方块
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 20;
    const startX = 400 - (barWidth * 1.5 + barSpacing);
    const startY = 250;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制填充（初始为红色，表示满血）
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每1秒执行一次）
    this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加状态提示文本
    this.statusText = this.add.text(400, 350, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  // 扣血方法
  takeDamage(amount) {
    if (this.health > 0) {
      this.health = Math.max(0, this.health - amount);
      this.updateHealthBars();
      this.updateHealthText();
      this.showStatus('受到伤害！');
      
      if (this.health === 0) {
        this.showStatus('生命值耗尽！');
      }
    }
  }

  // 回血方法
  regenerateHealth() {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.updateHealthBars();
      this.updateHealthText();
      this.showStatus('回复生命值！');
    }
  }

  // 更新血条显示
  updateHealthBars() {
    for (let i = 0; i < this.healthBars.length; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();
      
      // 绘制边框
      bar.graphics.lineStyle(3, 0xffffff, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      // 根据当前生命值决定填充颜色
      if (i < this.health) {
        // 有生命值：红色
        bar.graphics.fillStyle(0xff0000, 1);
      } else {
        // 无生命值：灰色
        bar.graphics.fillStyle(0x333333, 1);
      }
      
      bar.graphics.fillRect(
        bar.x + 3,
        bar.y + 3,
        bar.width - 6,
        bar.height - 6
      );
    }
  }

  // 更新生命值文本
  updateHealthText() {
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.health === 0) {
      this.healthText.setColor('#ff0000');
    } else if (this.health === this.maxHealth) {
      this.healthText.setColor('#00ff00');
    } else {
      this.healthText.setColor('#ffff00');
    }
  }

  // 显示状态提示
  showStatus(message) {
    this.statusText.setText(message);
    
    // 清除之前的定时器
    if (this.statusTimer) {
      this.statusTimer.remove();
    }
    
    // 2秒后清除状态文本
    this.statusTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.statusText.setText('');
      }
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);