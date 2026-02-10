class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBars = []; // 存储血条方块
    this.gameOver = false; // 游戏结束标志
  }

  preload() {
    // 无需加载外部资源
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

    // 创建血条容器
    this.createHealthBar();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 450, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const barWidth = 50; // 每格血条的宽度
    const barHeight = 30; // 血条高度
    const barGap = 10; // 血条间隔
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2; // 居中起始位置
    const startY = 200;

    // 创建 10 个紫色血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制外边框（深紫色）
      graphics.fillStyle(0x4a0e4e, 1);
      graphics.fillRect(
        startX + i * (barWidth + barGap) - 2,
        startY - 2,
        barWidth + 4,
        barHeight + 4
      );

      // 绘制内部填充（亮紫色）
      graphics.fillStyle(0x9b59b6, 1);
      graphics.fillRect(
        startX + i * (barWidth + barGap),
        startY,
        barWidth,
        barHeight
      );

      // 添加高光效果
      graphics.fillStyle(0xc39bd3, 0.5);
      graphics.fillRect(
        startX + i * (barWidth + barGap),
        startY,
        barWidth,
        barHeight / 3
      );

      this.healthBars.push(graphics);
    }
  }

  update() {
    // 检测空格键按下（使用 justDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.gameOver) {
      this.takeDamage();
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条
      this.healthBars[this.health].setVisible(false);
      
      // 更新生命值文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加屏幕震动效果
      this.cameras.main.shake(200, 0.005);

      // 检查是否游戏结束
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 添加闪烁动画
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 添加缩放动画
    this.tweens.add({
      targets: this.gameOverText,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // 更改生命值文本颜色
    this.healthText.setColor('#ff0000');
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

// 导出状态变量用于验证
game.getHealth = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.health : 0;
};

game.isGameOver = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.gameOver : false;
};