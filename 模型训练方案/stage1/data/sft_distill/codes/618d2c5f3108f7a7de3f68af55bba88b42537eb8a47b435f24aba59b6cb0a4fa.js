class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Click mouse to lose health', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 绘制血条容器
    this.drawHealthBars();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 350, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 450, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  drawHealthBars() {
    // 清除旧的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 20;
    const startX = 400 - (this.maxHealth * barWidth + (this.maxHealth - 1) * barSpacing) / 2;
    const startY = 250;

    // 绘制每个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制外边框（深灰色）
      graphics.lineStyle(3, 0x333333, 1);
      graphics.strokeRect(startX + i * (barWidth + barSpacing), startY, barWidth, barHeight);

      // 如果当前格子应该是满的，填充绿色
      if (i < this.health) {
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(
          startX + i * (barWidth + barSpacing) + 3,
          startY + 3,
          barWidth - 6,
          barHeight - 6
        );
      } else {
        // 空血条显示暗红色背景
        graphics.fillStyle(0x440000, 1);
        graphics.fillRect(
          startX + i * (barWidth + barSpacing) + 3,
          startY + 3,
          barWidth - 6,
          barHeight - 6
        );
      }

      this.healthBars.push(graphics);
    }
  }

  onPointerDown(pointer) {
    // 如果游戏已结束，不再处理点击
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.drawHealthBars();
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 如果生命值文本颜色随血量变化
      if (this.health === 0) {
        this.healthText.setColor('#ff0000');
      } else if (this.health === 1) {
        this.healthText.setColor('#ffaa00');
      }

      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
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

    // 移除输入监听
    this.input.off('pointerdown', this.onPointerDown, this);
    
    console.log('Game Over! Final health:', this.health);
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
  backgroundColor: '#222222',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);