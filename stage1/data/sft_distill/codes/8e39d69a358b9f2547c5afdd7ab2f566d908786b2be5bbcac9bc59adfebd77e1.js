class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储血条格子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 150, 'Click to take damage - Auto heal every 0.5s', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    const startX = 200;
    const startY = 300;
    const barWidth = 40;
    const barHeight = 50;
    const barGap = 5;

    // 创建10个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制填充（初始为满血红色）
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        filled: true
      });
    }

    // 创建生命值文字显示
    this.healthText = this.add.text(400, 400, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每0.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 500, // 0.5秒
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建状态显示文字
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  // 扣血方法
  takeDamage(amount) {
    if (this.health > 0) {
      this.health = Math.max(0, this.health - amount);
      this.updateHealthBar();
      this.statusText.setText('Damage Taken!').setColor('#ff0000');
      
      // 0.3秒后清除状态文字
      this.time.delayedCall(300, () => {
        this.statusText.setText('');
      });
    }
  }

  // 回血方法
  heal() {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.updateHealthBar();
      this.statusText.setText('Healed +1').setColor('#00ff00');
      
      // 0.3秒后清除状态文字
      this.time.delayedCall(300, () => {
        this.statusText.setText('');
      });
    }
  }

  // 更新血条显示
  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();
      
      // 绘制边框
      bar.graphics.lineStyle(2, 0xffffff, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      // 根据当前生命值绘制填充
      if (i < this.health) {
        // 有生命值：红色填充
        bar.graphics.fillStyle(0xff0000, 1);
        bar.graphics.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
        bar.filled = true;
      } else {
        // 无生命值：深灰色填充
        bar.graphics.fillStyle(0x333333, 1);
        bar.graphics.fillRect(bar.x + 2, bar.y + 2, bar.width - 4, bar.height - 4);
        bar.filled = false;
      }
    }
    
    // 更新生命值文字
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的逻辑
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