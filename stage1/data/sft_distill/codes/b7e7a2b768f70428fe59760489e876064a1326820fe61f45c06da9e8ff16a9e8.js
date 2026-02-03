class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      gameOver: false,
      keyPresses: 0
    };

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

    // 创建键盘输入监听
    this.setupKeyboardInput();

    // 创建Game Over文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 显示当前血量文本
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth
    }));
  }

  createHealthBar() {
    const barWidth = 60;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 200;

    // 创建8格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 背景（深灰色边框）
      const bg = this.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillRect(x, startY, barWidth, barHeight);

      // 血条（绿色填充）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x00ff00, 1);
      healthBar.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push(healthBar);
    }
  }

  setupKeyboardInput() {
    // 监听WASD键
    const keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 为每个键添加按下事件
    Object.keys(keys).forEach(keyName => {
      keys[keyName].on('down', () => {
        if (!this.gameOver) {
          this.takeDamage(keyName);
        }
      });
    });
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.keyPresses++;

      // 隐藏对应的血条（从右往左）
      const barIndex = this.currentHealth;
      if (barIndex >= 0 && barIndex < this.healthBars.length) {
        this.healthBars[barIndex].clear();
      }

      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      console.log(JSON.stringify({
        event: 'damage_taken',
        key: key,
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));

      // 检查是否死亡
      if (this.currentHealth <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 显示Game Over文本
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
      health: 0,
      totalKeyPresses: window.__signals__.keyPresses
    }));
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

// 游戏配置
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