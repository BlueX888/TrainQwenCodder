class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
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
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入监听
    this.setupKeyboardInput();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建当前血量显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 40;
    const barHeight = 60;
    const barSpacing = 10;
    const totalWidth = (barWidth + barSpacing) * this.maxHealth - barSpacing;
    const startX = (800 - totalWidth) / 2;
    const startY = 200;

    // 创建 12 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建单个血条格子
      const healthBar = this.add.graphics();
      
      // 绘制粉色填充
      healthBar.fillStyle(0xff69b4, 1); // 粉色
      healthBar.fillRect(x, y, barWidth, barHeight);
      
      // 绘制边框
      healthBar.lineStyle(3, 0xffffff, 1);
      healthBar.strokeRect(x, y, barWidth, barHeight);

      // 存储血条对象和位置信息
      this.healthBars.push({
        graphics: healthBar,
        x: x,
        y: y,
        width: barWidth,
        height: barHeight,
        active: true
      });
    }
  }

  setupKeyboardInput() {
    // 监听 W 键
    this.input.keyboard.on('keydown-W', () => {
      this.takeDamage();
    });

    // 监听 A 键
    this.input.keyboard.on('keydown-A', () => {
      this.takeDamage();
    });

    // 监听 S 键
    this.input.keyboard.on('keydown-S', () => {
      this.takeDamage();
    });

    // 监听 D 键
    this.input.keyboard.on('keydown-D', () => {
      this.takeDamage();
    });
  }

  takeDamage() {
    // 如果游戏已结束，不再处理伤害
    if (this.gameOver) {
      return;
    }

    // 如果还有血量，扣除 1 点
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.updateHealthText();

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 从右到左更新血条显示（最新损失的血量在最右边）
    const damageIndex = this.currentHealth; // 当前血量对应的索引就是要变灰的格子

    if (damageIndex < this.maxHealth) {
      const bar = this.healthBars[damageIndex];
      
      // 清除原有绘制
      bar.graphics.clear();
      
      // 绘制灰色填充（表示已损失）
      bar.graphics.fillStyle(0x666666, 1);
      bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      
      // 绘制边框
      bar.graphics.lineStyle(3, 0x888888, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      bar.active = false;
    }
  }

  updateHealthText() {
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Over - Health reached 0');
  }

  update(time, delta) {
    // 可用于其他更新逻辑
  }
}

// Phaser 游戏配置
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

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};