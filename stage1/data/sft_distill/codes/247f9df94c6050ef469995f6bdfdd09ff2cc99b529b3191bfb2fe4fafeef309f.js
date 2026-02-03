class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 15; // 可验证的状态变量
    this.maxHealth = 15;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 标题文字
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 提示文字
    this.add.text(400, 100, 'Right Click to Take Damage', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前血量数值
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const blockSpacing = 5;
    const startX = 400 - (15 * (blockWidth + blockSpacing)) / 2;
    const startY = 150;

    // 创建15个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建每个格子的Graphics对象
      const block = this.add.graphics();
      
      // 绘制边框
      block.lineStyle(2, 0x888888, 1);
      block.strokeRect(x, y, blockWidth, blockHeight);
      
      // 填充灰色（满血状态）
      block.fillStyle(0x808080, 1);
      block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        graphics: block,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight,
        filled: true
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 从右往左更新血条显示
    const damagedBlocks = this.maxHealth - this.health;
    
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.graphics.clear();

      // 绘制边框
      block.graphics.lineStyle(2, 0x888888, 1);
      block.graphics.strokeRect(block.x, block.y, block.width, block.height);

      // 判断是否应该显示为损失状态
      if (i >= this.health) {
        // 损失的血量用深灰色填充
        block.graphics.fillStyle(0x333333, 1);
        block.graphics.fillRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
        block.filled = false;
      } else {
        // 剩余血量用灰色填充
        block.graphics.fillStyle(0x808080, 1);
        block.graphics.fillRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
        block.filled = true;
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

    // 禁用输入提示
    this.add.text(400, 450, 'Game Over - Refresh to Restart', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);
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
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);