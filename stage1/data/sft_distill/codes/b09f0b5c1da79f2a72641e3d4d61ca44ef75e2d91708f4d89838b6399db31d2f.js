class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 当前生命值
    this.maxHealth = 3; // 最大生命值
    this.healthBars = []; // 存储血条图形对象
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 绘制血条
    this.drawHealthBars();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  drawHealthBars() {
    const barWidth = 80; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (barWidth * this.maxHealth + barSpacing * (this.maxHealth - 1)) / 2;
    const startY = 150;

    // 清空旧的血条
    this.healthBars.forEach(bar => bar.destroy());
    this.healthBars = [];

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框
      graphics.lineStyle(3, 0x000000, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值决定填充颜色
      if (i < this.health) {
        // 橙色填充（生命值存在）
        graphics.fillStyle(0xff8800, 1);
        graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 深灰色填充（生命值已失去）
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }

      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.drawHealthBars();
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

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

    // 输出游戏结束信息到控制台（用于验证）
    console.log('Game Over! Final Health:', this.health);
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

// 导出状态变量用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};