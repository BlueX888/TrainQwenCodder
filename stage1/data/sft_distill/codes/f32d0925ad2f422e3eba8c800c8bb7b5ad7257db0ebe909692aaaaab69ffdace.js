class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 初始生命值
    this.maxHealth = 10; // 最大生命值
    this.healthGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Click Left Mouse Button to Take Damage', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthGraphics = this.add.graphics();
    this.drawHealthBar();

    // 显示当前血量数值
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown() && !this.isGameOver) {
        this.takeDamage();
      }
    });

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();

    const barWidth = 50; // 每格宽度
    const barHeight = 30; // 每格高度
    const gap = 5; // 格子间距
    const startX = 150; // 起始 X 坐标
    const startY = 150; // 起始 Y 坐标

    // 绘制所有血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      if (i < this.health) {
        // 有血的格子 - 橙色填充
        this.healthGraphics.fillStyle(0xff8800, 1);
        this.healthGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 橙色边框
        this.healthGraphics.lineStyle(2, 0xff6600, 1);
        this.healthGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 空血的格子 - 深灰色填充
        this.healthGraphics.fillStyle(0x333333, 1);
        this.healthGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 灰色边框
        this.healthGraphics.lineStyle(2, 0x555555, 1);
        this.healthGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  takeDamage() {
    if (this.health > 0) {
      this.health -= 1;
      this.drawHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 血条闪烁效果
      this.tweens.add({
        targets: this.healthGraphics,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        ease: 'Linear'
      });

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // Game Over 文本动画
    this.tweens.add({
      targets: this.gameOverText,
      scale: { from: 0, to: 1.2 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 禁用输入（可选：也可以允许重新开始）
    this.input.enabled = false;

    // 添加重启提示
    const restartText = this.add.text(400, 450, 'Refresh to Restart', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: restartText,
      alpha: 1,
      duration: 1000,
      delay: 500
    });
  }

  update(time, delta) {
    // 可用于添加其他更新逻辑
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

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};