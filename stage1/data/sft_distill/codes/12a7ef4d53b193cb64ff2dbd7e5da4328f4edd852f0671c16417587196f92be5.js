class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12; // 当前生命值
    this.maxHealth = 12; // 最大生命值
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
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 显示当前血量文本
    this.healthText = this.add.text(400, 100, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      if (!this.isGameOver && this.health > 0) {
        this.takeDamage();
      }
    });
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();
    
    const barWidth = 40; // 每格血条的宽度
    const barHeight = 30; // 血条高度
    const barGap = 5; // 格子之间的间隙
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2; // 居中起始位置
    const startY = 200;
    
    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      
      if (i < this.health) {
        // 当前血量格子 - 橙色填充
        this.healthBarGraphics.fillStyle(0xFF8800, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 橙色边框
        this.healthBarGraphics.lineStyle(2, 0xFF6600, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 空血量格子 - 深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 灰色边框
        this.healthBarGraphics.lineStyle(2, 0x555555, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  takeDamage() {
    // 扣除 1 点生命值
    this.health = Math.max(0, this.health - 1);
    
    // 更新血条显示
    this.drawHealthBar();
    
    // 更新血量文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 检查是否死亡
    if (this.health === 0) {
      this.showGameOver();
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
    
    // 添加重启提示
    this.add.text(400, 400, 'Press R to Restart', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 监听 R 键重启
    const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    rKey.on('down', () => {
      this.scene.restart();
    });
    
    console.log('Game Over - Health:', this.health);
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
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);