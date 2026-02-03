class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals 对象用于验证
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      damageCount: 0
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器位置
    const barStartX = 250;
    const barY = 300;
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 20;

    // 绘制 3 格青色血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barStartX + i * (barWidth + barSpacing);
      
      // 创建血条背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, barY, barWidth, barHeight);

      // 创建血条前景（青色）
      const foreground = this.add.graphics();
      foreground.fillStyle(0x00ffff, 1);
      foreground.fillRect(x + 2, barY + 2, barWidth - 4, barHeight - 4);

      // 添加边框
      const border = this.add.graphics();
      border.lineStyle(2, 0x00ffff, 1);
      border.strokeRect(x, barY, barWidth, barHeight);

      // 保存血条引用
      this.healthBars.push({
        background,
        foreground,
        border,
        active: true
      });
    }

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 360, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 450, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建键盘输入监听
    this.cursors = this.input.keyboard.createCursorKeys();

    // 为每个方向键添加单独的监听器
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth
    }));
  }

  takeDamage() {
    // 如果游戏已结束，不处理输入
    if (this.gameOver) {
      return;
    }

    // 如果还有生命值，扣除 1 点
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;

      // 更新血条显示
      this.updateHealthBar();

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

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
    // 隐藏对应的血条格子
    const lostHealthIndex = this.currentHealth; // 当前血量对应要隐藏的索引
    
    if (lostHealthIndex >= 0 && lostHealthIndex < this.healthBars.length) {
      const bar = this.healthBars[lostHealthIndex];
      
      // 淡出动画
      this.tweens.add({
        targets: [bar.foreground, bar.border],
        alpha: 0,
        duration: 300,
        ease: 'Power2'
      });

      bar.active = false;
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // Game Over 文本闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用键盘输入
    this.input.keyboard.enabled = false;

    console.log(JSON.stringify({
      event: 'game_over',
      health: this.currentHealth,
      totalDamage: window.__signals__.damageCount
    }));
  }

  update(time, delta) {
    // 每帧更新逻辑（如需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);