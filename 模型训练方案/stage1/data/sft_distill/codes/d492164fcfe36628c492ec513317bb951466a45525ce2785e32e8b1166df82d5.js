class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 绘制初始血条
    this.drawHealthBar();
    
    // 添加提示文本
    this.add.text(400, 500, 'Press SPACE to take damage', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 显示当前血量文本
    this.healthText = this.add.text(400, 100, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '32px',
      color: '#ff8800',
      align: 'center'
    }).setOrigin(0.5);
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barWidth = 40;  // 每格宽度
    const barHeight = 30; // 每格高度
    const barGap = 5;     // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2;
    const startY = 200;
    
    // 绘制背景（空血条）
    this.healthBarGraphics.fillStyle(0x333333, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
    }
    
    // 绘制当前血量（橙色）
    this.healthBarGraphics.fillStyle(0xff8800, 1);
    for (let i = 0; i < this.currentHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
    }
    
    // 绘制边框
    this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理输入
    if (this.isGameOver) {
      return;
    }
    
    // 扣除 1 格血量
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血条显示
      this.drawHealthBar();
      
      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
      
      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

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
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // 显示重启提示
    this.add.text(400, 400, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 移除空格键监听
    this.spaceKey.off('down', this.takeDamage, this);
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