class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.healthBarGraphics = null;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建血条背景和容器
    this.healthBarGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 添加提示文本
    this.add.text(400, 100, 'Click to lose health', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 显示当前生命值文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    // 监听鼠标点击事件
    this.input.on('pointerdown', this.takeDamage, this);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 150;
    
    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框（黑色）
      this.healthBarGraphics.lineStyle(3, 0x000000, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 根据当前生命值决定填充颜色
      if (i < this.health) {
        // 存活的血条 - 绿色
        this.healthBarGraphics.fillStyle(0x00ff00, 1);
      } else {
        // 已损失的血条 - 深灰色
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      
      this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再响应点击
    if (this.gameOver) {
      return;
    }
    
    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.drawHealthBar();
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 检查是否游戏结束
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  showGameOver() {
    this.gameOver = true;
    
    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    
    // 显示 Game Over 文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 显示提示文本
    this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 更新生命值文本颜色为红色
    this.healthText.setColor('#ff0000');
  }

  update(time, delta) {
    // 本游戏不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);