class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 可验证的状态信号
    this.maxHealth = 5;
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文本
    this.instructionText = this.add.text(400, 150, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 生命值文本显示
    this.healthText = this.add.text(400, 400, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff8800',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    this.restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.handleClick, this);
  }

  drawHealthBar() {
    // 清空之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (barWidth * this.maxHealth + barSpacing * (this.maxHealth - 1)) / 2;
    const startY = 250;

    // 绘制每个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0x000000, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值决定填充颜色
      if (i < this.health) {
        // 橙色填充（有生命值）
        this.healthBarGraphics.fillStyle(0xff8800, 1);
      } else {
        // 深灰色填充（已损失）
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      // 添加高光效果
      if (i < this.health) {
        this.healthBarGraphics.fillStyle(0xffaa44, 0.5);
        this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, 10);
      }
    }
  }

  handleClick() {
    if (this.gameOver) {
      // 重启游戏
      this.restartGame();
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      this.updateHealthDisplay();

      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthDisplay() {
    // 重绘血条
    this.drawHealthBar();

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.healthBarGraphics,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
  }

  triggerGameOver() {
    this.gameOver = true;

    // 隐藏提示文本
    this.instructionText.setVisible(false);

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // Game Over 文本动画
    this.gameOverText.setScale(0);
    this.tweens.add({
      targets: this.gameOverText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  restartGame() {
    // 重置游戏状态
    this.health = this.maxHealth;
    this.gameOver = false;

    // 重置显示
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);
    this.instructionText.setVisible(true);

    // 停止所有动画
    this.tweens.killAll();

    // 重绘血条
    this.updateHealthDisplay();
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
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);