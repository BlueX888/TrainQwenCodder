class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 20; // 当前生命值
    this.maxHealth = 20; // 最大生命值
    this.healthBars = []; // 存储血条格子的 Graphics 对象
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, 'Purple Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加提示文本
    this.add.text(400, 100, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 150, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 添加调试信息（可验证状态）
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
    this.updateDebugInfo();
  }

  createHealthBar() {
    const barWidth = 30; // 每格血条的宽度
    const barHeight = 40; // 每格血条的高度
    const barSpacing = 5; // 格子之间的间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 250;

    // 创建 20 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 绘制紫色血条格子
      graphics.fillStyle(0x9933ff, 1); // 紫色
      graphics.fillRect(x, y, barWidth, barHeight);

      // 绘制边框
      graphics.lineStyle(2, 0x6600cc, 1); // 深紫色边框
      graphics.strokeRect(x, y, barWidth, barHeight);

      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health -= 1;
      this.updateHealthBar();
      this.updateDebugInfo();

      // 检查是否死亡
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新生命值文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

    // 更新血条显示：隐藏超出当前生命值的格子
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        // 显示紫色血条
        this.healthBars[i].setAlpha(1);
      } else {
        // 隐藏或变暗血条
        this.healthBars[i].setAlpha(0.2);
      }
    }
  }

  showGameOver() {
    this.gameOver = true;

    // 创建半透明黑色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 Game Over 文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 显示重启提示
    this.add.text(400, 400, 'Refresh page to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.updateDebugInfo();
  }

  updateDebugInfo() {
    // 更新调试信息，便于验证状态
    this.debugText.setText(
      `Debug Info:\n` +
      `Health: ${this.health}\n` +
      `Game Over: ${this.gameOver}`
    );
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
new Phaser.Game(config);