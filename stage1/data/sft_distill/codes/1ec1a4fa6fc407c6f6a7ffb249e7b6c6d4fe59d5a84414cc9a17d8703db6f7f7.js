class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10;
    this.maxHealth = 10;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Click to lose health', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建健康值文本显示
    this.healthText = this.add.text(400, 350, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 380, 'Click to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2 + barWidth / 2;
    const startY = 250;

    // 创建 10 个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x - barWidth / 2, startY - barHeight / 2, barWidth, barHeight);

      // 创建填充（青色）
      const fill = this.add.graphics();
      fill.fillStyle(0x00ffff, 1);
      fill.fillRect(x - barWidth / 2 + 2, startY - barHeight / 2 + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  takeDamage() {
    if (this.gameOver) {
      // 如果游戏结束，点击重启
      this.restartGame();
      return;
    }

    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加点击反馈动画
      this.cameras.main.shake(100, 0.005);

      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示，从右到左扣血
    const lostHealth = this.maxHealth - this.health;
    
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      const index = this.maxHealth - 1 - i; // 从右到左
      
      if (i < lostHealth) {
        // 已损失的生命值显示为灰色
        if (bar.active) {
          bar.fill.clear();
          bar.fill.fillStyle(0x444444, 1);
          bar.fill.fillRect(
            bar.background.x,
            bar.background.y,
            50 - 4,
            30 - 4
          );
          
          // 重新定位 fill
          const barWidth = 50;
          const barHeight = 30;
          const barSpacing = 10;
          const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2 + barWidth / 2;
          const startY = 250;
          const x = startX + index * (barWidth + barSpacing);
          
          bar.fill.clear();
          bar.fill.fillStyle(0x444444, 1);
          bar.fill.fillRect(x - barWidth / 2 + 2, startY - barHeight / 2 + 2, barWidth - 4, barHeight - 4);
          bar.active = false;
        }
      }
    }
  }

  showGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // Game Over 动画效果
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 500,
      repeat: -1
    });
  }

  restartGame() {
    // 重启游戏
    this.scene.restart();
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

const game = new Phaser.Game(config);