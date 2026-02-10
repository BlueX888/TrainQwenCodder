class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 初始生命值
    this.maxHealth = 20;
    this.isGameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统 - 按方向键扣血', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, '按 ↑ ↓ ← → 任意方向键扣除生命值', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 绘制初始血条
    this.drawHealthBar();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 为每个方向键添加单独的监听器，防止连续触发
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 600; // 总血条宽度
    const barHeight = 40; // 血条高度
    const barX = 100; // 起始 X 坐标
    const barY = 200; // 起始 Y 坐标
    const cellWidth = barWidth / this.maxHealth; // 每格宽度
    const gap = 2; // 格子间隙

    // 绘制背景（灰色）
    this.healthBarGraphics.fillStyle(0x333333, 1);
    this.healthBarGraphics.fillRect(barX, barY, barWidth, barHeight);

    // 绘制边框
    this.healthBarGraphics.lineStyle(3, 0xffffff, 1);
    this.healthBarGraphics.strokeRect(barX, barY, barWidth, barHeight);

    // 绘制蓝色生命格子
    this.healthBarGraphics.fillStyle(0x0099ff, 1);
    for (let i = 0; i < this.health; i++) {
      const cellX = barX + i * cellWidth + gap;
      const cellY = barY + gap;
      const actualCellWidth = cellWidth - gap * 2;
      const actualCellHeight = barHeight - gap * 2;
      
      this.healthBarGraphics.fillRect(cellX, cellY, actualCellWidth, actualCellHeight);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.isGameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.drawHealthBar();
      
      // 更新生命值文本
      this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.health === 0) {
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
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用键盘输入
    this.input.keyboard.removeAllListeners();
    
    // 添加重启提示
    this.add.text(400, 480, '刷新页面重新开始', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    console.log('Game Over - Health: 0');
  }

  update(time, delta) {
    // 可用于额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);