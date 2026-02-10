class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 可验证的状态信号
    this.maxHealth = 3;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器位置
    const startX = 250;
    const startY = 200;
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 20;

    // 绘制 3 个蓝色血条
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(3, 0x4444ff, 1);
      graphics.strokeRect(
        startX + i * (barWidth + barSpacing),
        startY,
        barWidth,
        barHeight
      );
      
      // 填充蓝色
      graphics.fillStyle(0x0088ff, 1);
      graphics.fillRect(
        startX + i * (barWidth + barSpacing) + 3,
        startY + 3,
        barWidth - 6,
        barHeight - 6
      );
      
      this.healthBars.push(graphics);
    }

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 260, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加键盘事件监听（防止连续按键）
    this.input.keyboard.on('keydown', (event) => {
      if (this.gameOver) return;
      
      // 检查是否是方向键
      if (event.code === 'ArrowUp' || 
          event.code === 'ArrowDown' || 
          event.code === 'ArrowLeft' || 
          event.code === 'ArrowRight') {
        this.takeDamage();
      }
    });

    // 显示当前状态信息
    this.add.text(10, 10, 'Status: Playing', {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条（从右往左消失）
      if (this.health < this.maxHealth) {
        this.healthBars[this.health].setVisible(false);
      }
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 根据生命值改变文本颜色
      if (this.health === 2) {
        this.healthText.setColor('#ffff00'); // 黄色
      } else if (this.health === 1) {
        this.healthText.setColor('#ff8800'); // 橙色
      } else if (this.health === 0) {
        this.healthText.setColor('#ff0000'); // 红色
        this.showGameOver();
      }
    }
  }

  showGameOver() {
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
    
    // 显示重启提示
    this.add.text(400, 450, 'Refresh to Restart', {
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

new Phaser.Game(config);