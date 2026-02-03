class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.healthBars = [];
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

    // 绘制血条容器背景
    const startX = 250;
    const startY = 200;
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 20;

    // 创建 3 个血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制背景框（深灰色）
      const background = this.add.graphics();
      background.lineStyle(3, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);
      
      // 绘制绿色血条
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x00ff00, 1);
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      
      this.healthBars.push(healthBar);
    }

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 270, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 550, '', {
      fontSize: '16px',
      color: '#ffff00'
    });
    this.updateDebugInfo();
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条（从右到左）
      const barIndex = this.health;
      if (this.healthBars[barIndex]) {
        // 添加消失动画效果
        this.tweens.add({
          targets: this.healthBars[barIndex],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.healthBars[barIndex].clear();
          }
        });
      }

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 根据生命值改变文本颜色
      if (this.health === 2) {
        this.healthText.setColor('#ffff00'); // 黄色
      } else if (this.health === 1) {
        this.healthText.setColor('#ff9900'); // 橙色
      } else if (this.health === 0) {
        this.healthText.setColor('#ff0000'); // 红色
        this.showGameOver();
      }

      this.updateDebugInfo();
    }
  }

  showGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本并添加闪烁效果
    this.gameOverText.setVisible(true);
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 添加重启提示
    this.add.text(400, 420, 'Refresh page to restart', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  updateDebugInfo() {
    this.debugText.setText(
      `Debug Info:\n` +
      `Health: ${this.health}\n` +
      `Game Over: ${this.gameOver}\n` +
      `Click count: ${this.maxHealth - this.health}`
    );
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