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
    // 初始化 signals
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      damageCount: 0
    };

    // 创建血条容器
    const barWidth = 80;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 50;
    const startY = 50;

    // 绘制 3 个青色血条
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制青色填充矩形
      graphics.fillStyle(0x00FFFF, 1); // 青色
      graphics.fillRect(
        startX + i * (barWidth + barSpacing),
        startY,
        barWidth,
        barHeight
      );
      
      // 绘制边框
      graphics.lineStyle(2, 0x008B8B, 1); // 深青色边框
      graphics.strokeRect(
        startX + i * (barWidth + barSpacing),
        startY,
        barWidth,
        barHeight
      );
      
      this.healthBars.push(graphics);
    }

    // 创建提示文本
    this.instructionText = this.add.text(50, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建生命值显示文本
    this.healthText = this.add.text(50, 130, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00FFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#FF0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 监听方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加键盘事件监听
    this.input.keyboard.on('keydown', (event) => {
      if (this.gameOver) return;

      // 检查是否是方向键
      if (event.code === 'ArrowUp' || 
          event.code === 'ArrowDown' || 
          event.code === 'ArrowLeft' || 
          event.code === 'ArrowRight') {
        this.takeDamage();
      }
    });

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.health,
      timestamp: Date.now()
    }));
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      window.__signals__.health = this.health;
      window.__signals__.damageCount++;

      // 隐藏对应的血条
      if (this.health < this.maxHealth) {
        this.healthBars[this.health].setVisible(false);
      }

      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      console.log(JSON.stringify({
        event: 'damage_taken',
        health: this.health,
        damageCount: window.__signals__.damageCount,
        timestamp: Date.now()
      }));

      // 检查是否死亡
      if (this.health === 0) {
        this.showGameOver();
      }
    }
  }

  showGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 隐藏提示文本
    this.instructionText.setVisible(false);

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
      finalHealth: this.health,
      totalDamage: window.__signals__.damageCount,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 每帧更新逻辑（此示例不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

const game = new Phaser.Game(config);