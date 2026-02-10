class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBars = [];
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建血条容器
    this.createHealthBar();

    // 创建提示文本
    const instructionText = this.add.text(400, 500, 'Click to lose health', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    instructionText.setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isGameOver) {
        this.takeDamage();
      }
    });

    // 显示当前血量文本
    this.healthText = this.add.text(400, 150, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - ((barWidth + barSpacing) * this.maxHealth - barSpacing) / 2;
    const startY = 200;

    // 创建 5 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深色边框）
      const bgBar = this.add.graphics();
      bgBar.fillStyle(0x333333, 1);
      bgBar.fillRect(x - 2, startY - 2, barWidth + 4, barHeight + 4);

      // 创建橙色血条
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff8800, 1); // 橙色
      healthBar.fillRect(x, startY, barWidth, barHeight);

      // 添加高光效果
      const highlight = this.add.graphics();
      highlight.fillStyle(0xffaa33, 0.5);
      highlight.fillRect(x, startY, barWidth, barHeight / 3);

      // 存储血条引用
      this.healthBars.push({
        bg: bgBar,
        bar: healthBar,
        highlight: highlight
      });
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 隐藏对应的血条（从右往左）
      const index = this.currentHealth;
      if (this.healthBars[index]) {
        this.healthBars[index].bar.setVisible(false);
        this.healthBars[index].highlight.setVisible(false);
      }

      // 添加扣血动画效果
      this.cameras.main.shake(100, 0.005);

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);

    // Game Over 文本闪烁动画
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 隐藏提示文本
    this.healthText.setVisible(false);

    console.log('Game Over! Final Health:', this.currentHealth);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};