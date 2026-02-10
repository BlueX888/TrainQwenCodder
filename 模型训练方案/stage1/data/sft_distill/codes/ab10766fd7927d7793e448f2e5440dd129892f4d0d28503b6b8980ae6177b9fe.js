class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建血条标题
    this.add.text(50, 50, 'Health:', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建血条 Graphics 对象
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建操作提示
    this.add.text(50, 150, 'Press SPACE to take damage', {
      fontSize: '18px',
      color: '#cccccc'
    });

    // 创建生命值数字显示
    this.healthText = this.add.text(50, 180, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  drawHealthBar() {
    // 清空之前的绘制
    this.healthBarGraphics.clear();

    const barX = 150; // 血条起始 X 坐标
    const barY = 50; // 血条起始 Y 坐标
    const cellWidth = 40; // 每格宽度
    const cellHeight = 30; // 每格高度
    const gap = 5; // 格子间隙

    // 绘制背景（空血条）
    this.healthBarGraphics.fillStyle(0x333333, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barX + i * (cellWidth + gap);
      this.healthBarGraphics.fillRect(x, barY, cellWidth, cellHeight);
    }

    // 绘制当前生命值（紫色）
    this.healthBarGraphics.fillStyle(0x9b59b6, 1); // 紫色
    for (let i = 0; i < this.health; i++) {
      const x = barX + i * (cellWidth + gap);
      this.healthBarGraphics.fillRect(x, barY, cellWidth, cellHeight);
    }

    // 绘制边框
    this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barX + i * (cellWidth + gap);
      this.healthBarGraphics.strokeRect(x, barY, cellWidth, cellHeight);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.isGameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      this.drawHealthBar();
      this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    
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

    // 移除空格键监听
    this.spaceKey.off('down', this.takeDamage, this);

    // 添加重启提示
    this.add.text(400, 400, 'Press R to Restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听 R 键重启游戏
    const restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    restartKey.on('down', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 此游戏不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);