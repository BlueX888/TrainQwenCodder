class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
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
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 150, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听，避免在 update 中重复触发
    this.spaceKey.on('down', () => {
      if (!this.gameOver && this.health > 0) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 添加重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 380, 'Refresh to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 5;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 200;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建血条背景（黑色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x000000, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（紫色）
      const bar = this.add.graphics();
      bar.fillStyle(0x9b59b6, 1); // 紫色
      bar.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background: background,
        bar: bar,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 更新血条显示
      this.updateHealthBar();

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示，已损失的格子变为灰色
    for (let i = 0; i < this.maxHealth; i++) {
      const barData = this.healthBars[i];
      barData.bar.clear();

      if (i < this.health) {
        // 存活的格子显示紫色
        barData.bar.fillStyle(0x9b59b6, 1);
      } else {
        // 已损失的格子显示灰色
        barData.bar.fillStyle(0x555555, 1);
      }

      barData.bar.fillRect(
        barData.x + 2,
        barData.y + 2,
        barData.width - 4,
        barData.height - 4
      );
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用空格键输入
    this.spaceKey.enabled = false;

    // 输出游戏结束状态到控制台（便于验证）
    console.log('Game Over! Final Health:', this.health);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
    // 当前不需要每帧更新
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);