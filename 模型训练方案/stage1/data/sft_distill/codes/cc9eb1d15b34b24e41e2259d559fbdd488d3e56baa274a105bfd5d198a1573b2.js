class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
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
      clicks: 0
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, 'Right Click to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    const startX = 200;
    const startY = 200;
    const blockWidth = 40;
    const blockHeight = 30;
    const blockSpacing = 5;

    // 创建 10 个血量格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景框（灰色边框）
      const border = this.add.graphics();
      border.lineStyle(2, 0x666666, 1);
      border.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量块（橙色填充）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff8800, 1);
      healthBlock.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        block: healthBlock,
        active: true
      });
    }

    // 显示当前血量文本
    this.healthText = this.add.text(400, 250, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff8800'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.gameOver) {
        this.takeDamage();
        window.__signals__.clicks++;
        console.log(JSON.stringify({
          event: 'rightClick',
          health: this.currentHealth,
          gameOver: this.gameOver,
          timestamp: Date.now()
        }));
      }
    });

    // 添加提示：如何触发右键
    this.add.text(400, 450, 'Note: Right-click anywhere on the canvas', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'gameStart',
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  takeDamage() {
    if (this.currentHealth > 0 && !this.gameOver) {
      this.currentHealth--;

      // 更新血条显示（从右向左消失）
      const index = this.currentHealth;
      if (this.healthBlocks[index]) {
        this.healthBlocks[index].block.clear();
        this.healthBlocks[index].active = false;
      }

      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 更新信号
      window.__signals__.health = this.currentHealth;

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
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

    console.log(JSON.stringify({
      event: 'gameOver',
      health: this.currentHealth,
      finalClicks: window.__signals__.clicks,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

const game = new Phaser.Game(config);