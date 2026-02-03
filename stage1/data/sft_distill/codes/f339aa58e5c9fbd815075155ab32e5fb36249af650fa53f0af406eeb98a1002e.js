class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3; // 当前生命值
    this.maxHealth = 3; // 最大生命值
    this.isGameOver = false;
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
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 创建重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 380, 'Press SPACE to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 创建当前血量显示文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加空格键用于重启
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 标记按键是否已按下（防止连续触发）
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update() {
    if (this.isGameOver) {
      // 游戏结束后检测空格键重启
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.restartGame();
      }
      return;
    }

    // 检测方向键按下（使用 JustDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.takeDamage();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.takeDamage();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.takeDamage();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.takeDamage();
    }
  }

  // 绘制血条
  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 80; // 每格血条宽度
    const barHeight = 40; // 血条高度
    const barSpacing = 10; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2; // 居中起始位置
    const startY = 150;

    // 绘制每格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制血条背景（深灰色边框）
      this.healthBarGraphics.lineStyle(3, 0x333333, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前血量决定是否填充蓝色
      if (i < this.health) {
        // 有血量：填充蓝色
        this.healthBarGraphics.fillStyle(0x0088ff, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 无血量：填充深色
        this.healthBarGraphics.fillStyle(0x222222, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  // 扣血逻辑
  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.drawHealthBar(); // 重绘血条
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加受伤闪烁效果
      this.cameras.main.shake(200, 0.005);

      // 检查是否游戏结束
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  // 触发游戏结束
  triggerGameOver() {
    this.isGameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 添加 Game Over 动画效果
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 屏幕闪烁效果
    this.cameras.main.flash(500, 255, 0, 0);
  }

  // 重启游戏
  restartGame() {
    this.scene.restart();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);