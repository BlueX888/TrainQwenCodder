class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.updateHealthBar();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(50, 150, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    // 创建提示文本
    this.add.text(50, 200, 'Press SPACE to take damage', {
      fontSize: '18px',
      color: '#cccccc'
    });
    
    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });
    
    // 创建自动回血定时器（每1.5秒回复1点）
    this.regenTimer = this.time.addEvent({
      delay: 1500,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });
    
    // 添加调试信息
    this.add.text(50, 250, 'Auto-regen: 1 HP per 1.5s', {
      fontSize: '18px',
      color: '#00ff00'
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（此示例中主要逻辑在事件中处理）
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();
    
    const barX = 50;
    const barY = 50;
    const barWidth = 60;
    const barHeight = 80;
    const barSpacing = 10;
    
    // 绘制每个血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barX + i * (barWidth + barSpacing);
      
      // 绘制背景（空血格）
      this.healthBarGraphics.fillStyle(0x333333, 1);
      this.healthBarGraphics.fillRect(x, barY, barWidth, barHeight);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, barY, barWidth, barHeight);
      
      // 如果当前血量大于索引，绘制满血格
      if (i < this.currentHealth) {
        // 根据生命值多少使用不同颜色
        let healthColor;
        if (this.currentHealth <= 1) {
          healthColor = 0xff0000; // 红色（危险）
        } else if (this.currentHealth <= 2) {
          healthColor = 0xff6600; // 橙色（警告）
        } else {
          healthColor = 0x00ff00; // 绿色（健康）
        }
        
        this.healthBarGraphics.fillStyle(healthColor, 1);
        this.healthBarGraphics.fillRect(x + 5, barY + 5, barWidth - 10, barHeight - 10);
      }
    }
  }

  /**
   * 受到伤害
   * @param {number} amount - 伤害值
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      
      // 添加视觉反馈
      this.cameras.main.shake(100, 0.005);
      
      if (this.currentHealth === 0) {
        this.showGameOverMessage();
      }
    }
  }

  /**
   * 回复生命值
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      
      // 添加回血视觉反馈
      this.tweens.add({
        targets: this.healthBarGraphics,
        alpha: { from: 1, to: 0.7 },
        duration: 200,
        yoyo: true
      });
    }
  }

  /**
   * 更新生命值文本
   */
  updateHealthText() {
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 1) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 2) {
      this.healthText.setColor('#ff6600');
    } else {
      this.healthText.setColor('#ffffff');
    }
  }

  /**
   * 显示游戏结束信息
   */
  showGameOverMessage() {
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    
    // 停止回血定时器
    if (this.regenTimer) {
      this.regenTimer.remove();
    }
    
    // 添加闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, HealthBarScene };
}