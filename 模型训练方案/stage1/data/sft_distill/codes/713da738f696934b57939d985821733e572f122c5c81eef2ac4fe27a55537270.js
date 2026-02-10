class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储每个血条格子的 Graphics 对象
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

    // 绘制血条
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 400, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ff69b4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听按键按下
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
  }

  createHealthBar() {
    const barWidth = 60; // 每个血条格子的宽度
    const barHeight = 30; // 血条格子的高度
    const barSpacing = 5; // 格子之间的间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 200;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      const x = startX + i * (barWidth + barSpacing);
      
      // 绘制粉色血条格子
      graphics.fillStyle(0xff69b4, 1); // 粉色
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight,
        filled: true
      });
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
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
    // 从右到左清空血条（最后一个有血的格子）
    const emptyIndex = this.health; // 要清空的格子索引
    
    if (emptyIndex < this.maxHealth) {
      const bar = this.healthBars[emptyIndex];
      
      // 清除原有绘制
      bar.graphics.clear();
      
      // 绘制灰色（空血）
      bar.graphics.fillStyle(0x444444, 1);
      bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      
      // 重新绘制边框
      bar.graphics.lineStyle(2, 0x666666, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
      
      bar.filled = false;
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
    
    // 禁用空格键输入
    this.spaceKey.enabled = false;
    
    // 更新生命值文本颜色
    this.healthText.setColor('#ff0000');
    
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
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};