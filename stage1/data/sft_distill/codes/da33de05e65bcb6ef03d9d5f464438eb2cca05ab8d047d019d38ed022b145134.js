class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 初始生命值
    this.maxHealth = 3;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建 Graphics 对象用于绘制血条
    this.healthGraphics = this.add.graphics();
    
    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    
    // 创建提示文本
    this.hintText = this.add.text(400, 500, 'Click to take damage', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.hintText.setOrigin(0.5);
    
    // 创建血量显示文本
    this.healthText = this.add.text(400, 150, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.healthText.setOrigin(0.5);
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.isGameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    this.healthGraphics.clear();
    
    const barWidth = 80; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (this.maxHealth * barWidth + (this.maxHealth - 1) * barSpacing) / 2;
    const startY = 200;
    
    // 绘制每格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框（黑色）
      this.healthGraphics.lineStyle(3, 0x000000, 1);
      this.healthGraphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 根据当前血量填充颜色
      if (i < this.health) {
        // 有血：橙色
        this.healthGraphics.fillStyle(0xff8800, 1);
      } else {
        // 无血：深灰色
        this.healthGraphics.fillStyle(0x333333, 1);
      }
      this.healthGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
    }
  }

  /**
   * 扣血逻辑
   */
  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.drawHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  /**
   * 触发 Game Over
   */
  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);
    this.hintText.setVisible(false);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    console.log('Game Over! Health:', this.health);
  }

  update(time, delta) {
    // 可验证的状态信号
    if (this.health === 0 && this.isGameOver) {
      // Game Over 状态
    }
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