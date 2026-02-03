class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 当前生命值
    this.maxHealth = 5; // 最大生命值
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建血条 Graphics 对象
    this.healthBarGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 添加说明文本
    this.add.text(50, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#ffffff'
    });
    
    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isGameOver && this.health > 0) {
        this.takeDamage();
      }
    });
    
    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barWidth = 60; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 50; // 起始 X 坐标
    const startY = 50; // 起始 Y 坐标
    
    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      if (i < this.health) {
        // 有生命值的格子 - 紫色填充
        this.healthBarGraphics.fillStyle(0x9966ff, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 添加边框
        this.healthBarGraphics.lineStyle(2, 0x6633cc, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 没有生命值的格子 - 深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 添加边框
        this.healthBarGraphics.lineStyle(2, 0x666666, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  takeDamage() {
    // 扣除生命值
    this.health--;
    
    // 确保生命值不小于 0
    if (this.health < 0) {
      this.health = 0;
    }
    
    // 重绘血条
    this.drawHealthBar();
    
    // 检查是否游戏结束
    if (this.health === 0) {
      this.triggerGameOver();
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
    
    // 输出到控制台便于验证
    console.log('GAME OVER - Health:', this.health);
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
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证使用
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};