class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12; // 可验证的状态信号
    this.maxHealth = 12;
    this.healthBars = [];
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
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 设置键盘输入监听
    this.setupInputs();
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 5;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 150;

    // 创建 12 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建背景边框
      const border = this.add.graphics();
      border.lineStyle(2, 0x000000, 1);
      border.strokeRect(x, y, barWidth, barHeight);

      // 创建血条填充
      const bar = this.add.graphics();
      bar.fillStyle(0xff69b4, 1); // 粉色
      bar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({ bar, x, y, width: barWidth, height: barHeight });
    }
  }

  setupInputs() {
    // 创建 WASD 键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    keyW.on('down', () => this.takeDamage());
    keyA.on('down', () => this.takeDamage());
    keyS.on('down', () => this.takeDamage());
    keyD.on('down', () => this.takeDamage());
  }

  takeDamage() {
    if (this.gameOver) return;

    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加受击闪烁效果
      this.cameras.main.shake(100, 0.005);

      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示，从右到左扣血
    const lostHealth = this.maxHealth - this.health;
    
    for (let i = 0; i < this.maxHealth; i++) {
      const barData = this.healthBars[i];
      barData.bar.clear();

      if (i >= this.health) {
        // 已损失的血条显示为灰色
        barData.bar.fillStyle(0x666666, 1);
      } else {
        // 剩余血条显示为粉色
        barData.bar.fillStyle(0xff69b4, 1);
      }

      barData.bar.fillRect(
        barData.x + 2,
        barData.y + 2,
        barData.width - 4,
        barData.height - 4
      );
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 添加 Game Over 动画效果
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });

    // 屏幕闪红效果
    this.cameras.main.flash(500, 255, 0, 0);

    console.log('Game Over - Health reached 0');
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
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);