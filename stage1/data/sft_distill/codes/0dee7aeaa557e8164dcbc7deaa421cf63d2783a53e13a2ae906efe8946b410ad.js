class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '按方向键扣血 (↑↓←→)', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 250, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 为每个方向键添加单独的事件监听
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 40;  // 每格宽度
    const barHeight = 30; // 每格高度
    const barGap = 5;     // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2; // 居中起始位置
    const startY = 150;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      const y = startY;

      if (i < this.currentHealth) {
        // 有生命值的格子 - 橙色填充
        this.healthBarGraphics.fillStyle(0xff8800, 1);
        this.healthBarGraphics.fillRect(x, y, barWidth, barHeight);

        // 橙色边框
        this.healthBarGraphics.lineStyle(2, 0xff6600, 1);
        this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);
      } else {
        // 空血条格子 - 深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, y, barWidth, barHeight);

        // 灰色边框
        this.healthBarGraphics.lineStyle(2, 0x666666, 1);
        this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);
      }
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理输入
    if (this.isGameOver) {
      return;
    }

    // 扣除生命值
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血条显示
      this.drawHealthBar();
      
      // 更新生命值文本
      this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用键盘输入
    this.input.keyboard.removeAllListeners();
    
    // 在控制台输出游戏状态（用于验证）
    console.log('Game Over! Final Health:', this.currentHealth);
  }

  update(time, delta) {
    // 本游戏不需要每帧更新逻辑
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

// 暴露状态变量用于验证
window.getGameState = function() {
  const scene = game.scene.getScene('HealthBarScene');
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};