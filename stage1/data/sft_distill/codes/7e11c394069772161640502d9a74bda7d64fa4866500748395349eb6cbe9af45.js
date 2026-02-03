class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Press WASD to lose health', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建生命值标签
    this.add.text(400, 150, 'Health:', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 绘制血条容器和格子
    this.createHealthBar();

    // 创建键盘输入
    this.setupKeyboardInput();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建生命值数字显示
    this.healthText = this.add.text(400, 500, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 60;
    const barHeight = 30;
    const spacing = 10;
    const startX = 400 - ((barWidth + spacing) * this.maxHealth - spacing) / 2;
    const startY = 200;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建血条背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（紫色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x9932cc, 1); // 紫色
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({
        background: background,
        fill: healthBar,
        active: true
      });
    }
  }

  setupKeyboardInput() {
    // 监听 W 键
    this.input.keyboard.on('keydown-W', () => {
      this.takeDamage();
    });

    // 监听 A 键
    this.input.keyboard.on('keydown-A', () => {
      this.takeDamage();
    });

    // 监听 S 键
    this.input.keyboard.on('keydown-S', () => {
      this.takeDamage();
    });

    // 监听 D 键
    this.input.keyboard.on('keydown-D', () => {
      this.takeDamage();
    });
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.gameOver) {
      return;
    }

    // 如果还有生命值
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血条显示（从右往左消失）
      const barIndex = this.currentHealth;
      if (this.healthBars[barIndex]) {
        this.healthBars[barIndex].fill.clear();
        this.healthBars[barIndex].active = false;
      }

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用所有输入
    this.input.keyboard.enabled = false;

    // 添加重启提示（3秒后）
    this.time.delayedCall(3000, () => {
      const restartText = this.add.text(400, 480, 'Refresh to restart', {
        fontSize: '20px',
        color: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: restartText,
        alpha: 0.5,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    });
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
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);