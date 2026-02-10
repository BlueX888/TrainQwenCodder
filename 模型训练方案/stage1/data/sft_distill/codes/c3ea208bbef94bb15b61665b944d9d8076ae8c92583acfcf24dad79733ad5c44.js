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
    // 创建标题文本
    this.add.text(400, 50, 'Click to Damage', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 100, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
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
    this.add.text(400, 550, 'Left Click to lose health', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 30;
    const blockHeight = 40;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap)) / 2;
    const startY = 200;

    // 创建 20 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建每个血条格子的 Graphics 对象
      const block = this.add.graphics();
      
      // 绘制外边框（深色）
      block.lineStyle(2, 0x333333, 1);
      block.strokeRect(x, y, blockWidth, blockHeight);
      
      // 填充灰色
      block.fillStyle(0x808080, 1);
      block.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      // 保存 block 对象和位置信息
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
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 更新对应的血条格子（从右往左扣血）
      const index = this.currentHealth;
      const block = this.healthBlocks[index];
      
      if (block && block.active) {
        block.active = false;
        
        // 清除原有绘制
        block.graphics.clear();
        
        // 重绘为深灰色（表示已损失）
        block.graphics.lineStyle(2, 0x333333, 1);
        block.graphics.strokeRect(block.x, block.y, block.width, block.height);
        block.graphics.fillStyle(0x404040, 1);
        block.graphics.fillRect(block.x + 2, block.y + 2, block.width - 4, block.height - 4);
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

    // 将所有剩余血条变暗（虽然已经全部扣完了）
    console.log('Game Over! Health reached 0');
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

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, HealthBarScene };
}