class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 初始生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储血条格子
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加提示文本
    this.add.text(400, 100, 'Click to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver && pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 50; // 每格血条的宽度
    const barHeight = 30; // 血条的高度
    const barSpacing = 5; // 血条之间的间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2; // 居中起始位置
    const startY = 150;

    // 创建 10 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x333333, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（青色）
      const fill = this.add.graphics();
      fill.fillStyle(0x00ffff, 1);
      fill.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      // 存储血条对象
      this.healthBars.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health -= 1;
      
      // 更新血条显示
      this.updateHealthBar();
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 从右到左清除血条
    const index = this.health; // 当前血量对应的索引位置
    
    if (index < this.maxHealth) {
      const bar = this.healthBars[index];
      
      // 清除填充，改为灰色
      bar.fill.clear();
      bar.fill.fillStyle(0x555555, 0.3);
      bar.fill.fillRect(
        bar.background.x,
        bar.background.y,
        48, // barWidth - 4
        26  // barHeight - 4
      );
      
      // 需要重新定位，因为 Graphics 的坐标是相对的
      const barWidth = 50;
      const barHeight = 30;
      const barSpacing = 5;
      const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
      const startY = 150;
      const x = startX + index * (barWidth + barSpacing);
      
      bar.fill.clear();
      bar.fill.fillStyle(0x555555, 0.3);
      bar.fill.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      
      bar.active = false;
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用输入提示
    this.children.list.forEach(child => {
      if (child.type === 'Text' && child.text === 'Click to take damage') {
        child.setVisible(false);
      }
    });

    console.log('Game Over! Health:', this.health);
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
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};