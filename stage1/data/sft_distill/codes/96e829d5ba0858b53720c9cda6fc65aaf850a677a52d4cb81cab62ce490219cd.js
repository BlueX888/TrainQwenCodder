class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 当前生命值
    this.maxHealth = 5; // 最大生命值
    this.healthBars = []; // 存储血条方块
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条
    this.createHealthBar();

    // 创建状态文本（用于显示当前血量）
    this.healthText = this.add.text(400, 450, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 80; // 每格血条宽度
    const barHeight = 40; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2; // 居中起始位置
    const startY = 200;

    // 创建 5 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建血条背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（橙色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff8800, 1); // 橙色
      fill.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      // 存储血条对象
      this.healthBars.push({
        background: background,
        fill: fill,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
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
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      
      // 清除之前的填充
      bar.fill.clear();

      if (i < this.health) {
        // 还有血量，显示橙色
        bar.fill.fillStyle(0xff8800, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      } else {
        // 已损失，显示深灰色
        bar.fill.fillStyle(0x444444, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      }
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

    // 显示重启提示
    this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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