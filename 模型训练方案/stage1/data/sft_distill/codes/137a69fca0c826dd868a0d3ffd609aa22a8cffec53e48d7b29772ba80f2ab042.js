class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 当前生命值
    this.maxHealth = 20; // 最大生命值
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 添加提示文本
    this.add.text(50, 150, 'Press Arrow Keys to Lose Health', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    // 显示当前生命值文本
    this.healthText = this.add.text(50, 180, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#00ffff'
    });
    
    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听方向键按下事件（使用 justDown 避免重复触发）
    this.input.keyboard.on('keydown', (event) => {
      if (this.isGameOver) return;
      
      // 检查是否是方向键
      if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT ||
          event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
        
        this.takeDamage(1);
      }
    });
  }

  /**
   * 扣除生命值
   */
  takeDamage(amount) {
    if (this.isGameOver) return;
    
    this.health = Math.max(0, this.health - amount);
    
    // 更新血条显示
    this.drawHealthBar();
    
    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 检查是否死亡
    if (this.health <= 0) {
      this.showGameOver();
    }
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barX = 50; // 血条起始 X 坐标
    const barY = 50; // 血条起始 Y 坐标
    const cellWidth = 30; // 每格宽度
    const cellHeight = 40; // 每格高度
    const cellSpacing = 2; // 格子间距
    const cellsPerRow = 10; // 每行格子数
    
    // 绘制背景框（灰色）
    this.healthBarGraphics.fillStyle(0x333333, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const col = i % cellsPerRow;
      const row = Math.floor(i / cellsPerRow);
      const x = barX + col * (cellWidth + cellSpacing);
      const y = barY + row * (cellHeight + cellSpacing);
      
      this.healthBarGraphics.fillRect(x, y, cellWidth, cellHeight);
    }
    
    // 绘制当前生命值（蓝色）
    this.healthBarGraphics.fillStyle(0x0088ff, 1);
    for (let i = 0; i < this.health; i++) {
      const col = i % cellsPerRow;
      const row = Math.floor(i / cellsPerRow);
      const x = barX + col * (cellWidth + cellSpacing);
      const y = barY + row * (cellHeight + cellSpacing);
      
      this.healthBarGraphics.fillRect(x, y, cellWidth, cellHeight);
    }
    
    // 绘制边框
    this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const col = i % cellsPerRow;
      const row = Math.floor(i / cellsPerRow);
      const x = barX + col * (cellWidth + cellSpacing);
      const y = barY + row * (cellHeight + cellSpacing);
      
      this.healthBarGraphics.strokeRect(x, y, cellWidth, cellHeight);
    }
  }

  /**
   * 显示 Game Over
   */
  showGameOver() {
    this.isGameOver = true;
    
    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    
    // 显示 Game Over 文本
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    
    // 添加重启提示
    this.add.text(400, 380, 'Refresh to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);