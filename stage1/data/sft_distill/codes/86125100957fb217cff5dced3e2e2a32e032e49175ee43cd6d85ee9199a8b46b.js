class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Right Click to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建显示当前血量的文本
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // 创建Game Over文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const blockSpacing = 5;
    const totalWidth = (blockWidth + blockSpacing) * this.maxHealth - blockSpacing;
    const startX = 400 - totalWidth / 2;
    const startY = 250;

    // 创建15个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建单个血条方块
      const block = this.add.graphics();
      
      // 绘制边框
      block.lineStyle(2, 0x666666, 1);
      block.strokeRect(x, y, blockWidth, blockHeight);
      
      // 绘制填充（灰色表示有血量）
      block.fillStyle(0x888888, 1);
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

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const isActive = i < this.currentHealth;

      // 清除之前的绘制
      block.graphics.clear();

      // 绘制边框
      block.graphics.lineStyle(2, 0x666666, 1);
      block.graphics.strokeRect(block.x, block.y, block.width, block.height);

      // 根据状态绘制填充
      if (isActive) {
        // 有血量：浅灰色
        block.graphics.fillStyle(0x888888, 1);
      } else {
        // 无血量：深灰色
        block.graphics.fillStyle(0x333333, 1);
      }
      block.graphics.fillRect(
        block.x + 2,
        block.y + 2,
        block.width - 4,
        block.height - 4
      );

      block.active = isActive;
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

    // 可选：禁用输入
    this.input.enabled = false;

    console.log('Game Over! Health reached 0');
  }

  update(time, delta) {
    // 可以在这里添加每帧更新的逻辑
  }
}

// 游戏配置
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

// 导出状态用于验证
game.getHealthStatus = function() {
  const scene = game.scene.getScene('HealthBarScene');
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};