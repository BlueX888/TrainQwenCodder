class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 提示文本
    this.add.text(400, 100, 'Press Arrow Keys to Lose Health', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条
    this.createHealthBar();

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（防止按住不放时连续扣血）
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 当前血量显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 150;
    const startY = 200;
    const blockWidth = 30;
    const blockHeight = 40;
    const gap = 5;

    // 创建 15 个血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建单个血格的容器
      const graphics = this.add.graphics();
      
      // 绘制橙色填充
      graphics.fillStyle(0xff8800, 1);
      graphics.fillRect(x, y, blockWidth, blockHeight);

      // 绘制边框
      graphics.lineStyle(2, 0xffaa44, 1);
      graphics.strokeRect(x, y, blockWidth, blockHeight);

      // 添加高光效果
      graphics.fillStyle(0xffaa44, 0.5);
      graphics.fillRect(x, y, blockWidth, 8);

      this.healthBlocks.push(graphics);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.currentHealth > 0) {
      this.currentHealth--;

      // 隐藏最右边的血格
      const blockIndex = this.currentHealth;
      if (this.healthBlocks[blockIndex]) {
        // 添加消失动画效果
        this.tweens.add({
          targets: this.healthBlocks[blockIndex],
          alpha: 0,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            this.healthBlocks[blockIndex].setVisible(false);
          }
        });
      }

      // 更新血量文本
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

    // 添加闪烁动画
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 禁用键盘输入
    this.input.keyboard.removeAllListeners();

    // 添加重启提示
    const restartText = this.add.text(400, 380, 'Refresh to Restart', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 输出游戏结束信号到控制台
    console.log('Game Over - Health reached 0');
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