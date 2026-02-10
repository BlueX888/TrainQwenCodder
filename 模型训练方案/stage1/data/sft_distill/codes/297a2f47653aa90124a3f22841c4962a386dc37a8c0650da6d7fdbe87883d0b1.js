class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12; // 可验证的状态信号
    this.maxHealth = 12;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff8800',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听 WASD 键盘输入
    this.input.keyboard.on('keydown-W', () => this.takeDamage());
    this.input.keyboard.on('keydown-A', () => this.takeDamage());
    this.input.keyboard.on('keydown-S', () => this.takeDamage());
    this.input.keyboard.on('keydown-D', () => this.takeDamage());

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 480, 'Refresh to restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const startX = 150;
    const startY = 180;
    const barWidth = 40;
    const barHeight = 20;
    const spacing = 5;

    // 创建 12 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      const graphics = this.add.graphics();

      // 绘制橙色填充
      graphics.fillStyle(0xff8800, 1);
      graphics.fillRect(x, startY, barWidth, barHeight);

      // 绘制深色边框
      graphics.lineStyle(2, 0x884400, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);

      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理伤害
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条格子
      this.healthBars[this.health].setVisible(false);

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;

    // 显示 Game Over 文本
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

    // 禁用键盘输入
    this.input.keyboard.enabled = false;

    console.log('Game Over! Final health:', this.health);
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
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);