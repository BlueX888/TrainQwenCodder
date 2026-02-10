class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 初始生命值
    this.maxHealth = 5; // 最大生命值
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建当前血量文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（防止重复触发）
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 60; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 180;

    // 绘制背景（空血条）
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0x00ffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      
      // 如果当前格子有血量，填充青色
      if (i < this.health) {
        this.healthBarGraphics.fillStyle(0x00ffff, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 空血条显示暗色
        this.healthBarGraphics.fillStyle(0x003333, 0.5);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.isGameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.health > 0) {
      this.health--;
      this.drawHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加受伤闪烁效果
      this.cameras.main.shake(100, 0.005);

      // 检查是否死亡
      if (this.health === 0) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    this.isGameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // 添加 Game Over 动画效果
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });

    // 禁用输入
    this.input.keyboard.enabled = false;

    // 添加重启提示
    this.add.text(400, 420, 'Refresh to Restart', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText(
      `Health: ${this.health}\n` +
      `Game Over: ${this.isGameOver}\n` +
      `Time: ${Math.floor(time / 1000)}s`
    );
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
new Phaser.Game(config);