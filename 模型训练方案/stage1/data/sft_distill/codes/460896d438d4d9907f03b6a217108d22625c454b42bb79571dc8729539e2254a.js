class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 初始生命值
    this.maxHealth = 20;
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Click to Damage', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 100, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 监听鼠标点击事件
    this.input.on('pointerdown', () => {
      if (!this.isGameOver) {
        this.takeDamage(1);
      }
    });

    // 添加提示文本
    this.add.text(400, 500, 'Left Click to take damage', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  drawHealthBar() {
    const barWidth = 600; // 总宽度
    const barHeight = 40; // 血条高度
    const cellCount = this.maxHealth; // 格子数量
    const cellWidth = barWidth / cellCount; // 每格宽度
    const cellPadding = 2; // 格子间距
    const startX = 100; // 起始 X 坐标
    const startY = 150; // 起始 Y 坐标

    this.healthBarGraphics.clear();

    // 绘制背景框
    this.healthBarGraphics.lineStyle(2, 0x666666, 1);
    this.healthBarGraphics.strokeRect(startX - 5, startY - 5, barWidth + 10, barHeight + 10);

    // 绘制每一格血条
    for (let i = 0; i < cellCount; i++) {
      const x = startX + i * cellWidth;
      
      if (i < this.health) {
        // 有血的格子 - 灰色
        this.healthBarGraphics.fillStyle(0x808080, 1);
      } else {
        // 没血的格子 - 深灰色（空格）
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }

      // 绘制格子（带间距）
      this.healthBarGraphics.fillRect(
        x + cellPadding,
        startY + cellPadding,
        cellWidth - cellPadding * 2,
        barHeight - cellPadding * 2
      );

      // 绘制格子边框
      this.healthBarGraphics.lineStyle(1, 0x555555, 1);
      this.healthBarGraphics.strokeRect(
        x + cellPadding,
        startY + cellPadding,
        cellWidth - cellPadding * 2,
        barHeight - cellPadding * 2
      );
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    
    // 确保生命值不低于 0
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

    // 重绘血条
    this.drawHealthBar();

    // 检查是否游戏结束
    if (this.health <= 0 && !this.isGameOver) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;

    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 Game Over 文本
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

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
      color: '#ffffff'
    }).setOrigin(0.5);

    console.log('Game Over! Final health:', this.health);
  }

  update(time, delta) {
    // 可以在这里添加每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);