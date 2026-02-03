class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 可验证的状态信号
    this.maxHealth = 5;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加键盘事件监听（防止连续扣血）
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 显示当前血量数值
    this.healthText = this.add.text(400, 320, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const barWidth = 80;
    const barHeight = 40;
    const spacing = 10;

    // 绘制 5 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条（青色填充）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x00ffff, 1); // 青色
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push(healthBar);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.gameOver) {
      return;
    }

    // 如果还有血量，扣除 1 点
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 清除对应格子的血条
    const barIndex = this.health; // 当前血量对应的索引
    if (barIndex < this.healthBars.length) {
      this.healthBars[barIndex].clear();
      
      // 添加空血条效果（深色填充）
      const startX = 200;
      const startY = 250;
      const barWidth = 80;
      const barHeight = 40;
      const spacing = 10;
      const x = startX + barIndex * (barWidth + spacing);
      
      this.healthBars[barIndex].fillStyle(0x444444, 0.5);
      this.healthBars[barIndex].fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
    }
  }

  showGameOver() {
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

    // 显示重启提示
    this.add.text(400, 480, 'Refresh to Restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);