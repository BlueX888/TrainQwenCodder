class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加键盘事件监听
    this.spaceKey.on('down', () => {
      if (!this.gameOver) {
        this.takeDamage();
      }
    });

    // 显示当前血量文本（用于验证状态）
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 250;

    // 创建 5 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建血条背景（深色边框）
      const background = this.add.graphics();
      background.fillStyle(0x4a0040, 1);
      background.fillRect(x - 2, startY - 2, barWidth + 4, barHeight + 4);

      // 创建血条主体（紫色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0x9d4edd, 1);
      healthBar.fillRect(x, startY, barWidth, barHeight);

      // 添加高光效果
      const highlight = this.add.graphics();
      highlight.fillStyle(0xc77dff, 0.5);
      highlight.fillRect(x, startY, barWidth, barHeight / 3);

      // 存储血条对象
      this.healthBars.push({
        background: background,
        bar: healthBar,
        highlight: highlight
      });
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      // 更新血条显示
      this.updateHealthBar();
      
      // 更新血量文本
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      // 检查是否游戏结束
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 隐藏对应的血条格子（从右到左）
    const index = this.currentHealth;
    if (index < this.healthBars.length) {
      const barSet = this.healthBars[index];
      
      // 添加消失动画效果
      this.tweens.add({
        targets: [barSet.bar, barSet.highlight],
        alpha: 0,
        duration: 200,
        ease: 'Power2'
      });
    }
  }

  showGameOver() {
    this.gameOver = true;

    // 创建半透明黑色遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 显示 Game Over 文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 添加闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加重启提示
    this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);