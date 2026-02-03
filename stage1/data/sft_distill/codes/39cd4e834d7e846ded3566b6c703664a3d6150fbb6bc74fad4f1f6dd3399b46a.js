class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建 Graphics 对象用于绘制血条
    this.healthGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 添加提示文本
    this.instructionText = this.add.text(400, 500, '点击鼠标左键扣血', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);
    
    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    
    // 添加生命值显示文本
    this.healthText = this.add.text(400, 100, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    });
    this.healthText.setOrigin(0.5);
    
    // 监听鼠标左键点击事件
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();
    
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * barWidth + (this.maxHealth - 1) * barSpacing) / 2;
    const startY = 200;
    
    // 绘制血条背景（灰色）
    for (let i = 0; i < this.maxHealth; i++) {
      this.healthGraphics.fillStyle(0x333333, 1);
      this.healthGraphics.fillRect(
        startX + i * (barWidth + barSpacing),
        startY,
        barWidth,
        barHeight
      );
    }
    
    // 绘制当前生命值（橙色）
    for (let i = 0; i < this.health; i++) {
      this.healthGraphics.fillStyle(0xff8800, 1);
      this.healthGraphics.fillRect(
        startX + i * (barWidth + barSpacing) + 2,
        startY + 2,
        barWidth - 4,
        barHeight - 4
      );
    }
    
    // 绘制边框
    for (let i = 0; i < this.maxHealth; i++) {
      this.healthGraphics.lineStyle(2, 0xffffff, 1);
      this.healthGraphics.strokeRect(
        startX + i * (barWidth + barSpacing),
        startY,
        barWidth,
        barHeight
      );
    }
  }

  onPointerDown(pointer) {
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
      this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
      
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
    
    // 隐藏提示文本
    this.instructionText.setVisible(false);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // 输出状态到控制台便于验证
    console.log('Game Over! Final health:', this.health);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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
const game = new Phaser.Game(config);