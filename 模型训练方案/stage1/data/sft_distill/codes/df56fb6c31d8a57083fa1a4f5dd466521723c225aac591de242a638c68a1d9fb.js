class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20;
    this.maxHealth = 20;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Click to Lose Health', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 120, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    const barStartX = 150;
    const barStartY = 200;
    const barWidth = 25;
    const barHeight = 40;
    const barGap = 5;

    // 绘制 20 个紫色血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barStartX + i * (barWidth + barGap);
      const y = barStartY;

      // 创建血格背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, barWidth, barHeight);

      // 创建血格（紫色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x9b59b6, 1); // 紫色
      healthBar.fillRect(x, y, barWidth, barHeight);

      // 添加边框
      healthBar.lineStyle(2, 0x8e44ad, 1); // 深紫色边框
      healthBar.strokeRect(x, y, barWidth, barHeight);

      this.healthBars.push(healthBar);
    }

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标左键点击
    this.input.on('pointerdown', this.onPointerDown, this);

    // 添加说明文本
    this.add.text(400, 500, 'Click anywhere to lose 1 health point', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  onPointerDown(pointer) {
    if (this.gameOver) {
      // 游戏结束后点击重启
      this.restartGame();
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 隐藏对应的血格（从右向左消失）
    const index = this.health;
    if (index >= 0 && index < this.healthBars.length) {
      // 使用淡出效果
      this.tweens.add({
        targets: this.healthBars[index],
        alpha: 0,
        duration: 200,
        ease: 'Power2'
      });
    }
  }

  triggerGameOver() {
    this.gameOver = true;

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
      repeat: -1
    });
  }

  restartGame() {
    // 重置游戏状态
    this.health = this.maxHealth;
    this.gameOver = false;

    // 隐藏 Game Over 文本
    this.gameOverText.setVisible(false);
    this.restartText.setVisible(false);
    this.tweens.killAll();

    // 恢复所有血格
    this.healthBars.forEach(bar => {
      bar.setAlpha(1);
    });

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
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
  backgroundColor: '#2c3e50',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);