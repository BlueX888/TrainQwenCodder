class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.gameOver = false;
    this.healthBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '按方向键扣血', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (barWidth * this.maxHealth + barSpacing * (this.maxHealth - 1)) / 2;
    const startY = 100;

    // 绘制 3 个血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建血条背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);
      
      // 创建血条填充（蓝色）
      const fill = this.add.graphics();
      fill.fillStyle(0x0088ff, 1);
      fill.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      
      this.healthBars.push({ background, fill, x, y: startY });
    }

    // 创建提示文本
    this.instructionText = this.add.text(400, 200, '按任意方向键扣除生命值', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 250, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加额外的按键监听（用于检测任意方向键按下）
    this.input.keyboard.on('keydown', (event) => {
      if (this.gameOver) return;
      
      // 检查是否是方向键
      if (event.keyCode >= 37 && event.keyCode <= 40) {
        this.takeDamage();
      }
    });
  }

  takeDamage() {
    if (this.health <= 0 || this.gameOver) return;

    // 扣除生命值
    this.health--;
    
    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);

    // 更新血条显示
    this.updateHealthBars();

    // 检查是否游戏结束
    if (this.health <= 0) {
      this.triggerGameOver();
    }
  }

  updateHealthBars() {
    // 更新每个血条的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      
      // 清除之前的填充
      bar.fill.clear();
      
      if (i < this.health) {
        // 显示蓝色血条（存活的生命值）
        bar.fill.fillStyle(0x0088ff, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, 74, 24);
      } else {
        // 显示灰色血条（已损失的生命值）
        bar.fill.fillStyle(0x555555, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, 74, 24);
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

    // 隐藏提示文本
    this.instructionText.setVisible(false);

    // 禁用键盘输入
    this.input.keyboard.enabled = false;

    console.log('Game Over! Health:', this.health);
  }

  update(time, delta) {
    // 游戏主循环（本例中不需要持续更新）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);