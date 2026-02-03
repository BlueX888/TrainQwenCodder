class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器（用于绘制血条）
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 绘制初始血条
    this.drawHealthBar();
  }

  update() {
    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isGameOver) {
      this.takeDamage();
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health -= 1;
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      this.drawHealthBar();

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 40; // 每格血条宽度
    const barHeight = 50; // 血条高度
    const barSpacing = 5; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 300;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      if (i < this.health) {
        // 有生命值的格子 - 白色填充
        this.healthBarGraphics.fillStyle(0xffffff, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 添加黑色边框
        this.healthBarGraphics.lineStyle(2, 0x000000, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 失去生命值的格子 - 灰色边框
        this.healthBarGraphics.lineStyle(2, 0x666666, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);
    
    // 添加重启提示
    this.add.text(400, 470, 'Refresh to restart', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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