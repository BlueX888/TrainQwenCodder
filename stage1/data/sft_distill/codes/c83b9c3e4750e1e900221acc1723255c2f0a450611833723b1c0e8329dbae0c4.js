class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5; // 可验证的状态信号
    this.maxHealth = 5;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 60;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 150;

    // 创建 5 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深色边框）
      const background = this.add.graphics();
      background.fillStyle(0x4a0080, 1); // 深紫色背景
      background.fillRect(x - 2, startY - 2, barWidth + 4, barHeight + 4);

      // 创建血条主体
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x9d4edd, 1); // 紫色
      healthBar.fillRect(x, startY, barWidth, barHeight);

      // 添加高光效果
      const highlight = this.add.graphics();
      highlight.fillStyle(0xc77dff, 0.5); // 浅紫色高光
      highlight.fillRect(x, startY, barWidth, barHeight / 3);

      this.healthBars.push({
        background: background,
        bar: healthBar,
        highlight: highlight
      });
    }
  }

  takeDamage() {
    if (this.gameOver) {
      return;
    }

    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加受伤闪烁效果
      this.cameras.main.shake(100, 0.005);

      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 隐藏对应的血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      if (i >= this.health) {
        // 血量不足的格子变暗
        this.healthBars[i].bar.clear();
        this.healthBars[i].bar.fillStyle(0x2d1b3d, 1); // 暗紫色
        this.healthBars[i].bar.fillRect(
          this.healthBars[i].bar.x || (400 - (this.maxHealth * 70 - 10) / 2 + i * 70),
          150,
          60,
          30
        );
        this.healthBars[i].highlight.setVisible(false);
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 禁用空格键
    this.spaceKey.off('down', this.takeDamage, this);

    // 添加游戏结束动画
    this.tweens.add({
      targets: this.gameOverText,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 3 秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 血条呼吸效果（仅当存活时）
    if (!this.gameOver && this.health > 0) {
      const pulse = Math.sin(time / 300) * 0.1 + 1;
      for (let i = 0; i < this.health; i++) {
        this.healthBars[i].highlight.setAlpha(pulse * 0.5);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene
};

new Phaser.Game(config);