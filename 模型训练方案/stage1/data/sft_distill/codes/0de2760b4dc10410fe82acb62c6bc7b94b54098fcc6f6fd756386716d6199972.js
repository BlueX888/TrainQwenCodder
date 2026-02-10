class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20;
    this.maxHealth = 20;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      health: this.health,
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

    // 绘制提示文本
    const instruction = this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    instruction.setOrigin(0.5);

    // 绘制血条容器
    this.createHealthBar();

    // 显示当前血量文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 记录按键状态，避免长按连续触发
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 日志输出
    console.log(JSON.stringify({
      event: 'game_start',
      health: this.health,
      maxHealth: this.maxHealth
    }));
  }

  createHealthBar() {
    const blockWidth = 30;
    const blockHeight = 40;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap)) / 2 + blockWidth / 2;
    const startY = 180;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建单个血条方块
      const block = this.add.graphics();
      block.fillStyle(0x888888, 1); // 灰色
      block.fillRect(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);
      
      // 添加边框
      block.lineStyle(2, 0x444444, 1);
      block.strokeRect(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);

      this.healthBlocks.push(block);
    }
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 检测方向键按下（只在按键刚按下时触发一次）
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
    if (this.health <= 0) {
      return;
    }

    this.health--;
    window.__signals__.health = this.health;
    window.__signals__.damageCount++;

    // 更新血条显示（将最右边的满血格子变暗）
    const blockIndex = this.health;
    if (blockIndex >= 0 && blockIndex < this.healthBlocks.length) {
      const block = this.healthBlocks[blockIndex];
      block.clear();
      block.fillStyle(0x333333, 0.5); // 深灰色半透明
      const blockWidth = 30;
      const blockHeight = 40;
      const startX = 400 - (this.maxHealth * (blockWidth + 5)) / 2 + blockWidth / 2;
      const startY = 180;
      const x = startX + blockIndex * (blockWidth + 5);
      const y = startY;
      block.fillRect(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);
      
      // 重绘边框
      block.lineStyle(2, 0x222222, 0.5);
      block.strokeRect(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);
    }

    // 更新血量文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

    // 日志输出
    console.log(JSON.stringify({
      event: 'damage_taken',
      health: this.health,
      maxHealth: this.maxHealth
    }));

    // 检查是否死亡
    if (this.health <= 0) {
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
      health: this.health,
      totalDamage: window.__signals__.damageCount
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

new Phaser.Game(config);