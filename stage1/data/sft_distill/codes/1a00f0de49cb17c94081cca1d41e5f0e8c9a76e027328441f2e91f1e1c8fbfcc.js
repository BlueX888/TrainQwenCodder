class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Click to Damage', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建血量显示文本
    this.healthText = this.add.text(400, 150, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 添加提示文本
    this.add.text(400, 500, 'Left Click to decrease health', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 5;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 200;

    // 创建 10 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制橙色填充
      graphics.fillStyle(0xff8800, 1);
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血量显示
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
      
      // 隐藏对应的血条（从右到左）
      const barIndex = this.currentHealth;
      if (this.healthBars[barIndex]) {
        this.healthBars[barIndex].setVisible(false);
      }
      
      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // 输出状态信号到控制台（用于验证）
    console.log('Game Over! Final Health:', this.currentHealth);
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
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态变量用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};