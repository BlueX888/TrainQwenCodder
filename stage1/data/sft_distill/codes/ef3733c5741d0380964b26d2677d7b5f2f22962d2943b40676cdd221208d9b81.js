class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 3;
    this.maxHealth = 3;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals 用于验证
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      keyPresses: 0
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

    // 创建血条容器
    const barStartX = 250;
    const barY = 300;
    const barWidth = 80;
    const barHeight = 30;
    const barGap = 20;

    // 绘制 3 个青色血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barStartX + i * (barWidth + barGap);
      
      // 创建背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, barY, barWidth, barHeight);
      
      // 创建血条（青色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x00ffff, 1); // 青色
      healthBar.fillRect(x + 2, barY + 2, barWidth - 4, barHeight - 4);
      
      // 创建边框
      const border = this.add.graphics();
      border.lineStyle(2, 0xffffff, 1);
      border.strokeRect(x, barY, barWidth, barHeight);
      
      this.healthBars.push(healthBar);
    }

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 360, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 450, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 为每个方向键添加单次按下监听
    this.input.keyboard.on('keydown-UP', () => this.takeDamage());
    this.input.keyboard.on('keydown-DOWN', () => this.takeDamage());
    this.input.keyboard.on('keydown-LEFT', () => this.takeDamage());
    this.input.keyboard.on('keydown-RIGHT', () => this.takeDamage());

    // 输出初始状态日志
    console.log(JSON.stringify({
      event: 'game_start',
      health: this.health,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  takeDamage() {
    // 游戏结束后不再处理输入
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      window.__signals__.health = this.health;
      window.__signals__.keyPresses++;

      // 隐藏对应的血条
      if (this.health < this.maxHealth) {
        this.healthBars[this.health].setVisible(false);
      }

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 输出扣血日志
      console.log(JSON.stringify({
        event: 'damage_taken',
        health: this.health,
        remaining: this.health,
        timestamp: Date.now()
      }));

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 将生命值文本变红
    this.healthText.setColor('#ff0000');

    // 禁用输入
    this.input.keyboard.enabled = false;

    // 输出 Game Over 日志
    console.log(JSON.stringify({
      event: 'game_over',
      finalHealth: this.health,
      totalKeyPresses: window.__signals__.keyPresses,
      timestamp: Date.now()
    }));

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
    // 此场景不需要每帧更新逻辑
  }
}

// 游戏配置
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