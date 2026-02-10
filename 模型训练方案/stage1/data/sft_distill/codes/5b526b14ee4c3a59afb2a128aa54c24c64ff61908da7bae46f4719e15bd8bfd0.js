class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      damageCount: 0
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 为每个方向键添加单次按下事件
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建当前生命值显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth
    }));
  }

  createHealthBar() {
    const barWidth = 30;
    const barHeight = 40;
    const barSpacing = 5;
    const barsPerRow = 10;
    const startX = 400 - (barsPerRow * (barWidth + barSpacing)) / 2;
    const startY = 200;

    for (let i = 0; i < this.maxHealth; i++) {
      const row = Math.floor(i / barsPerRow);
      const col = i % barsPerRow;
      const x = startX + col * (barWidth + barSpacing);
      const y = startY + row * (barHeight + barSpacing);

      // 创建单个血条格子
      const bar = this.add.graphics();
      
      // 绘制外边框（黑色）
      bar.lineStyle(2, 0x000000, 1);
      bar.strokeRect(x, y, barWidth, barHeight);
      
      // 绘制填充（灰色表示满血）
      bar.fillStyle(0x808080, 1);
      bar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({ graphics: bar, x, y, barWidth, barHeight });
    }
  }

  takeDamage() {
    if (this.gameOver) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;

      // 更新血条显示
      this.updateHealthBar();

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);

      console.log(JSON.stringify({
        event: 'damage_taken',
        health: this.currentHealth,
        damageCount: window.__signals__.damageCount
      }));

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 计算需要变暗的血条数量
    const lostHealth = this.maxHealth - this.currentHealth;

    // 从后往前更新血条（最右边的先变暗）
    for (let i = this.maxHealth - 1; i >= this.maxHealth - lostHealth; i--) {
      const bar = this.healthBars[i];
      
      // 清除之前的绘制
      bar.graphics.clear();
      
      // 重新绘制边框
      bar.graphics.lineStyle(2, 0x000000, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.barWidth, bar.barHeight);
      
      // 绘制深灰色填充表示已损失
      bar.graphics.fillStyle(0x333333, 1);
      bar.graphics.fillRect(bar.x + 2, bar.y + 2, bar.barWidth - 4, bar.barHeight - 4);
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
      event: 'game_over',
      health: this.currentHealth,
      totalDamage: window.__signals__.damageCount
    }));
  }

  update(time, delta) {
    // 更新逻辑（如果需要）
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