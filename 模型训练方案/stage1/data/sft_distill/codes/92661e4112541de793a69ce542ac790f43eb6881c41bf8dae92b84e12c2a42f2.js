class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 可验证的状态信号
    this.maxHealth = 20;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '紫色血条 UI', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, '点击鼠标左键扣血', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建血量数值显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // 添加调试信息
    console.log('Game started with health:', this.health);
  }

  createHealthBar() {
    const barWidth = 30;  // 每格血条宽度
    const barHeight = 40; // 每格血条高度
    const barSpacing = 5; // 血条间距
    const barsPerRow = 10; // 每行血条数量
    const startX = 400 - (barsPerRow * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 200;

    // 创建 20 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const row = Math.floor(i / barsPerRow);
      const col = i % barsPerRow;
      const x = startX + col * (barWidth + barSpacing);
      const y = startY + row * (barHeight + barSpacing);

      // 创建血条背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, barWidth, barHeight);

      // 创建血条前景（紫色）
      const foreground = this.add.graphics();
      foreground.fillStyle(0x9932cc, 1); // 紫色
      foreground.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      // 添加边框
      const border = this.add.graphics();
      border.lineStyle(2, 0x666666, 1);
      border.strokeRect(x, y, barWidth, barHeight);

      // 保存血条引用
      this.healthBars.push({
        background: background,
        foreground: foreground,
        border: border
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      console.log('Health decreased to:', this.health);

      // 更新血量显示
      this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);

      // 隐藏对应的血条
      const barIndex = this.health; // 隐藏从右到左的血条
      if (this.healthBars[barIndex]) {
        this.healthBars[barIndex].foreground.clear();
        
        // 添加扣血动画效果
        this.tweens.add({
          targets: this.healthBars[barIndex].background,
          alpha: 0.3,
          duration: 200,
          yoyo: false
        });
      }

      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    console.log('GAME OVER - Health reached 0');

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // Game Over 文本缩放动画
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 所有血条变暗
    this.healthBars.forEach(bar => {
      this.tweens.add({
        targets: [bar.background, bar.border],
        alpha: 0.3,
        duration: 1000
      });
    });

    // 血量文本变红
    this.healthText.setColor('#ff0000');
  }

  update(time, delta) {
    // 每帧更新逻辑（如需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);