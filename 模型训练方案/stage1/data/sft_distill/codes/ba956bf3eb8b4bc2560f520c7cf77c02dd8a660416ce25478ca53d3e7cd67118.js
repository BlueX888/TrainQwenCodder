class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 当前生命值
    this.maxHealth = 10; // 最大生命值
    this.healthBarGraphics = null;
    this.gameOverText = null;
    this.isGameOver = false;
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
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建当前血量显示文本
    this.healthText = this.add.text(400, 350, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 450, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    const barWidth = 50; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 5; // 血条间距
    const startX = 150; // 起始 X 坐标
    const startY = 200; // 起始 Y 坐标

    // 清空之前的绘制
    this.healthBarGraphics.clear();

    // 绘制背景（空血条）
    this.healthBarGraphics.fillStyle(0x333333, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
    }

    // 绘制当前血量（橙色）
    this.healthBarGraphics.fillStyle(0xff8800, 1);
    for (let i = 0; i < this.health; i++) {
      const x = startX + i * (barWidth + barSpacing);
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
    }

    // 绘制血条边框
    this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
    }
  }

  /**
   * 扣血处理
   */
  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.isGameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.health > 0) {
      this.health--;
      
      // 更新血条显示
      this.drawHealthBar();
      
      // 更新血量文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  /**
   * 触发游戏结束
   */
  triggerGameOver() {
    this.isGameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // 禁用空格键输入
    this.spaceKey.off('down', this.takeDamage, this);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出状态到控制台（用于验证）
    console.log('Game Over! Final Health:', this.health);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.getScene('HealthBarScene');
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};