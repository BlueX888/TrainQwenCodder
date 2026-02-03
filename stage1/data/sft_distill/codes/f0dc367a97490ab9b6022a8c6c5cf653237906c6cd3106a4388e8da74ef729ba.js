class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press W/A/S/D to lose health', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建当前血量显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 设置键盘输入
    this.setupInput();
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 5;
    const totalWidth = (barWidth + barSpacing) * this.maxHealth - barSpacing;
    const startX = (800 - totalWidth) / 2;
    const startY = 200;

    // 创建 12 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, barWidth, barHeight);

      // 创建橙色血条
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff8800, 1); // 橙色
      healthBar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);

      // 添加高光效果
      const highlight = this.add.graphics();
      highlight.fillStyle(0xffaa44, 0.6);
      highlight.fillRect(x + 2, y + 2, barWidth - 4, (barHeight - 4) / 3);

      this.healthBars.push({
        bar: healthBar,
        highlight: highlight,
        background: background
      });
    }
  }

  setupInput() {
    // 监听 WASD 键
    const keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 为每个键添加按下事件
    Object.keys(keys).forEach(key => {
      keys[key].on('down', () => {
        if (!this.gameOver) {
          this.takeDamage();
        }
      });
    });
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;

      // 隐藏对应的血条
      const index = this.currentHealth;
      if (this.healthBars[index]) {
        this.healthBars[index].bar.setVisible(false);
        this.healthBars[index].highlight.setVisible(false);
      }

      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 血条闪烁效果
      this.cameras.main.shake(100, 0.005);

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // Game Over 文本缩放动画
    this.tweens.add({
      targets: this.gameOverText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      repeat: -1,
      duration: 500,
      ease: 'Sine.easeInOut'
    });

    // 屏幕变暗效果
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, 800, 600);
    overlay.setDepth(-1);

    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 1000,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 导出状态供验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};