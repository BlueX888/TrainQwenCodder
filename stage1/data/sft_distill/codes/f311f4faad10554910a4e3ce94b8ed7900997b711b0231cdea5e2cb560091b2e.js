class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      damageCount: 0
    };

    // 绘制标题
    const title = this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    // 提示文本
    const hint = this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前血量文本
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 防止按键重复触发的标志
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 日志输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth
    }));
  }

  createHealthBar() {
    const blockWidth = 30;
    const blockHeight = 40;
    const blockSpacing = 5;
    const startX = 400 - (20 * (blockWidth + blockSpacing)) / 2;
    const startY = 200;

    // 创建 20 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建血条格子的 Graphics 对象
      const block = this.add.graphics();
      
      // 绘制外边框（白色）
      block.lineStyle(2, 0xffffff, 1);
      block.strokeRect(x, y, blockWidth, blockHeight);
      
      // 绘制内部填充（灰色）
      block.fillStyle(0x808080, 1);
      block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        graphics: block,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight,
        active: true
      });
    }
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 检测方向键按下（单次触发）
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.keyPressed.up = true;
      this.takeDamage();
    } else if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.keyPressed.down = true;
      this.takeDamage();
    } else if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.keyPressed.left = true;
      this.takeDamage();
    } else if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.keyPressed.right = true;
      this.takeDamage();
    } else if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }
  }

  takeDamage() {
    if (this.currentHealth <= 0) {
      return;
    }

    this.currentHealth--;
    window.__signals__.health = this.currentHealth;
    window.__signals__.damageCount++;

    // 更新血条显示（从右到左扣血）
    const blockIndex = this.currentHealth; // 当前要变暗的格子索引
    if (blockIndex >= 0 && blockIndex < this.healthBlocks.length) {
      const block = this.healthBlocks[blockIndex];
      block.active = false;

      // 清除原有绘制
      block.graphics.clear();

      // 重新绘制外边框
      block.graphics.lineStyle(2, 0xffffff, 1);
      block.graphics.strokeRect(block.x, block.y, block.width, block.height);

      // 绘制深灰色/黑色填充表示失去的生命值
      block.graphics.fillStyle(0x202020, 1);
      block.graphics.fillRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
    }

    // 更新血量文本
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 日志输出
    console.log(JSON.stringify({
      event: 'damage_taken',
      health: this.currentHealth,
      damageCount: window.__signals__.damageCount
    }));

    // 检查是否 Game Over
    if (this.currentHealth <= 0) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

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

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_over',
      health: 0,
      totalDamage: window.__signals__.damageCount
    }));
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);