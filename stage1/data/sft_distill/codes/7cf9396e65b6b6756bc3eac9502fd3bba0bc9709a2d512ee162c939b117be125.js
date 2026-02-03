class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 15; // 初始生命值
    this.maxHealth = 15;
    this.healthBars = []; // 存储血条方格
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 绘制血条
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 为每个方向键添加单次按下监听
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
  }

  createHealthBar() {
    const barWidth = 40; // 每格宽度
    const barHeight = 40; // 每格高度
    const barSpacing = 5; // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 200;

    // 创建 15 个血条方格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建血条背景（黑色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x000000, 1);
      background.strokeRect(x, y, barWidth, barHeight);

      // 创建血条填充（橙色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff8800, 1);
      fill.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background: background,
        fill: fill,
        x: x,
        y: y,
        active: true
      });
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    const lostHealth = this.maxHealth - this.health;
    
    // 从右往左将失去的生命值显示为灰色
    for (let i = this.maxHealth - 1; i >= this.maxHealth - lostHealth; i--) {
      if (this.healthBars[i].active) {
        // 清除原有填充
        this.healthBars[i].fill.clear();
        
        // 重新绘制为灰色
        this.healthBars[i].fill.fillStyle(0x555555, 1);
        this.healthBars[i].fill.fillRect(
          this.healthBars[i].x + 2,
          this.healthBars[i].y + 2,
          38,
          38
        );
        
        this.healthBars[i].active = false;
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

    // 禁用输入
    this.input.keyboard.enabled = false;

    console.log('Game Over! Final Health:', this.health);
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

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};