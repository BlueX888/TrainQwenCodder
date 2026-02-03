class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建血条背景和前景图形对象
    this.healthBarGraphics = this.add.graphics();
    
    // 初始绘制血条
    this.drawHealthBar();
    
    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    
    // 添加说明文本
    this.add.text(400, 500, 'Press SPACE to take damage', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 监听空格键输入
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.isGameOver && this.health > 0) {
        this.takeDamage();
      }
    });
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barX = 200; // 血条起始 X 坐标
    const barY = 100; // 血条起始 Y 坐标
    const cellWidth = 40; // 每格宽度
    const cellHeight = 30; // 每格高度
    const cellGap = 5; // 格子间距
    
    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barX + i * (cellWidth + cellGap);
      
      // 绘制背景（深灰色边框）
      this.healthBarGraphics.lineStyle(2, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, barY, cellWidth, cellHeight);
      
      // 根据当前生命值决定填充颜色
      if (i < this.health) {
        // 有生命值的格子填充粉色
        this.healthBarGraphics.fillStyle(0xff69b4, 1); // 粉色
        this.healthBarGraphics.fillRect(x + 2, barY + 2, cellWidth - 4, cellHeight - 4);
      } else {
        // 没有生命值的格子填充暗色
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x + 2, barY + 2, cellWidth - 4, cellHeight - 4);
      }
    }
    
    // 显示当前生命值文本
    this.healthBarGraphics.fillStyle(0xffffff, 1);
    // 使用独立的文本对象来显示生命值
    if (this.healthText) {
      this.healthText.destroy();
    }
    this.healthText = this.add.text(barX, barY + cellHeight + 20, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff'
    });
  }

  /**
   * 扣血逻辑
   */
  takeDamage() {
    if (this.health > 0) {
      this.health -= 1;
      this.drawHealthBar();
      
      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  /**
   * 触发游戏结束
   */
  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
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
new Phaser.Game(config);