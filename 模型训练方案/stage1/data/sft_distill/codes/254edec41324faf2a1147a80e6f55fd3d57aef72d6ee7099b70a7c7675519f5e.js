class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储血条格子的数组
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 150, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建空格键监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      if (!this.gameOver) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 400, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 320, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 40; // 每格血条的宽度
    const barHeight = 50; // 每格血条的高度
    const barSpacing = 10; // 血条之间的间距
    const totalWidth = (barWidth + barSpacing) * this.maxHealth - barSpacing;
    const startX = 400 - totalWidth / 2; // 居中起始位置
    const startY = 220;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制白色填充矩形
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, barWidth, barHeight);
      
      // 绘制黑色边框
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeRect(0, 0, barWidth, barHeight);
      
      // 设置位置
      graphics.setPosition(startX + i * (barWidth + barSpacing), startY);
      
      // 存储到数组中
      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条格子（从右到左消失）
      const index = this.health;
      if (this.healthBars[index]) {
        this.healthBars[index].setVisible(false);
      }
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
      
      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
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
    
    // 禁用空格键
    this.spaceKey.enabled = false;
    
    console.log('Game Over! Final Health:', this.health);
  }

  update(time, delta) {
    // 每帧更新逻辑（本示例不需要）
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