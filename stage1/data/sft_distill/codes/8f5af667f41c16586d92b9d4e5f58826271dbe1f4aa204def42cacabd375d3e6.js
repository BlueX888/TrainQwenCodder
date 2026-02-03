class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化可验证信号
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

    // 创建说明文本
    this.add.text(400, 100, 'Right Click to Take Damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.gameOver) {
        this.takeDamage();
      }
    });

    // 显示当前血量文本
    this.healthText = this.add.text(400, 320, `Health: ${this.currentHealth}/${this.maxHealth}`, {
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
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const totalWidth = (barWidth + barSpacing) * this.maxHealth - barSpacing;
    const startX = (800 - totalWidth) / 2;
    const startY = 200;

    // 创建 10 个血量格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, y, barWidth, barHeight);

      // 创建血量格（橙色填充）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff8800, 1);
      healthBar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        graphics: healthBar,
        visible: true
      });
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;

      // 隐藏最右边的血量格
      const index = this.currentHealth;
      if (index >= 0 && index < this.healthBars.length) {
        this.healthBars[index].graphics.setVisible(false);
        this.healthBars[index].visible = false;
      }

      // 更新血量文本
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

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;
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