class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 15; // 当前生命值
    this.maxHealth = 15; // 最大生命值
    this.healthBars = []; // 存储每个血条格子的 Graphics 对象
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 提示文本
    this.add.text(400, 100, 'Right Click to Lose Health', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 500, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 40; // 每格宽度
    const barHeight = 30; // 每格高度
    const barSpacing = 5; // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 200;

    // 创建 15 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制灰色血条格子
      graphics.fillStyle(0x808080, 1); // 灰色
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        active: true
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示，从右到左扣血
    const lostHealthIndex = this.maxHealth - this.health - 1;
    
    if (lostHealthIndex >= 0 && lostHealthIndex < this.healthBars.length) {
      const bar = this.healthBars[this.maxHealth - this.health - 1];
      
      // 清除原有绘制
      bar.graphics.clear();
      
      // 绘制深灰色/黑色表示已损失
      bar.graphics.fillStyle(0x2a2a2a, 1); // 深灰色
      bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      
      // 绘制边框
      bar.graphics.lineStyle(2, 0x000000, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      bar.active = false;
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Over! Health reached 0');
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: HealthBarScene
};

new Phaser.Game(config);