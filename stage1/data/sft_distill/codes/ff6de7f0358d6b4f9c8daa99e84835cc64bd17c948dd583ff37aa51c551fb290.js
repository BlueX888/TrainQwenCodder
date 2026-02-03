class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12; // 可验证的状态信号
    this.maxHealth = 12;
    this.healthBlocks = [];
    this.gameOver = false;
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
    this.add.text(400, 100, 'Press W, A, S, or D to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    const healthBarX = 200;
    const healthBarY = 200;
    const blockWidth = 40;
    const blockHeight = 30;
    const blockSpacing = 5;

    // 创建血条标签
    this.add.text(healthBarX - 20, healthBarY, 'HP:', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // 创建 12 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = healthBarX + i * (blockWidth + blockSpacing);
      const y = healthBarY;

      // 使用 Graphics 绘制血条格子
      const block = this.add.graphics();
      this.drawHealthBlock(block, 0, 0, blockWidth, blockHeight, true);
      block.setPosition(x, y);

      this.healthBlocks.push(block);
    }

    // 创建当前血量显示文本
    this.healthText = this.add.text(healthBarX, healthBarY + 50, `Health: ${this.health} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff69b4',
      fontStyle: 'bold'
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 监听 WASD 键盘输入
    this.input.keyboard.on('keydown-W', () => this.takeDamage());
    this.input.keyboard.on('keydown-A', () => this.takeDamage());
    this.input.keyboard.on('keydown-S', () => this.takeDamage());
    this.input.keyboard.on('keydown-D', () => this.takeDamage());

    // 添加重启提示（初始隐藏）
    this.restartText = this.add.text(400, 380, 'Press R to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 监听 R 键重启游戏
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  // 绘制单个血条格子
  drawHealthBlock(graphics, x, y, width, height, isFilled) {
    graphics.clear();

    if (isFilled) {
      // 粉色填充
      graphics.fillStyle(0xff69b4, 1);
      graphics.fillRect(x, y, width, height);

      // 添加高光效果
      graphics.fillStyle(0xffb6d9, 0.5);
      graphics.fillRect(x, y, width, height / 3);
    } else {
      // 灰色空血条
      graphics.fillStyle(0x444444, 1);
      graphics.fillRect(x, y, width, height);
    }

    // 边框
    graphics.lineStyle(2, 0x333333, 1);
    graphics.strokeRect(x, y, width, height);
  }

  // 扣血逻辑
  takeDamage() {
    if (this.gameOver) {
      return; // 游戏结束后不再扣血
    }

    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();

      // 更新血量文本
      this.healthText.setText(`Health: ${this.health} / ${this.maxHealth}`);

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  // 更新血条显示
  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const isFilled = i < this.health;
      this.drawHealthBlock(this.healthBlocks[i], 0, 0, 40, 30, isFilled);
    }
  }

  // 触发游戏结束
  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 导出状态信号供验证使用
window.getGameState = () => {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};