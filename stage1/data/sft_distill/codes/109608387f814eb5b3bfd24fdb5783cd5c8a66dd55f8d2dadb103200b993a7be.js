class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Press Arrow Keys to Lose Health', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建提示文本
    this.instructionText = this.add.text(400, 500, 'Health: 5/5', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（防止重复触发）
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 150;

    // 创建 5 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（青色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x00ffff, 1);
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push(healthBar);
    }
  }

  takeDamage() {
    if (this.gameOver) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.instructionText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      this.healthBars[i].clear();
      
      if (i < this.currentHealth) {
        // 显示青色血条
        const barWidth = 80;
        const barHeight = 40;
        const barSpacing = 10;
        const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
        const startY = 150;
        const x = startX + i * (barWidth + barSpacing);
        
        this.healthBars[i].fillStyle(0x00ffff, 1);
        this.healthBars[i].fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    
    // 禁用输入
    this.input.keyboard.enabled = false;

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
    // 每帧更新逻辑（当前无需额外逻辑）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

new Phaser.Game(config);