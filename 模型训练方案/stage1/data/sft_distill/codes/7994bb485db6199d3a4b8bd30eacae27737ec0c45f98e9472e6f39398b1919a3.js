class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12; // 初始生命值
    this.maxHealth = 12; // 最大生命值
    this.isGameOver = false;
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
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键事件
    this.keyW.on('down', () => this.takeDamage());
    this.keyA.on('down', () => this.takeDamage());
    this.keyS.on('down', () => this.takeDamage());
    this.keyD.on('down', () => this.takeDamage());

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);

    // 创建当前血量显示
    this.healthText = this.add.text(400, 450, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    const barWidth = 50; // 每格宽度
    const barHeight = 30; // 每格高度
    const barGap = 5; // 格子间隔
    const startX = 400 - (this.maxHealth * (barWidth + barGap) - barGap) / 2; // 居中起始位置
    const startY = 200;

    // 绘制所有格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barGap);
      
      if (i < this.health) {
        // 有血量的格子 - 橙色填充
        this.healthBarGraphics.fillStyle(0xFF8800, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 橙色边框
        this.healthBarGraphics.lineStyle(2, 0xFF6600, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      } else {
        // 空血量的格子 - 深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
        
        // 灰色边框
        this.healthBarGraphics.lineStyle(2, 0x555555, 1);
        this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
      }
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.isGameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.health > 0) {
      this.health--;
      this.drawHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.gameOverText.setVisible(true);

    // 禁用所有按键输入
    this.keyW.removeAllListeners();
    this.keyA.removeAllListeners();
    this.keyS.removeAllListeners();
    this.keyD.removeAllListeners();

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出游戏结束状态到控制台（用于验证）
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

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    maxHealth: scene.maxHealth,
    isGameOver: scene.isGameOver
  };
};