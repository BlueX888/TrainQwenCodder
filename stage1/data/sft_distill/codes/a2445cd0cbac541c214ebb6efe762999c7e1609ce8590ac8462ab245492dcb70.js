class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建血条容器
    this.healthBarX = 100;
    this.healthBarY = 50;
    this.barWidth = 50;
    this.barHeight = 30;
    this.barGap = 5;

    // 创建 Graphics 对象用于绘制血条
    this.healthGraphics = this.add.graphics();

    // 绘制初始血条
    this.drawHealthBar();

    // 添加提示文本
    this.instructionText = this.add.text(100, 150, 'Click to lose health', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 显示当前血量文本
    this.healthText = this.add.text(100, 200, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.takeDamage, this);
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();

    // 绘制背景（灰色空格）
    this.healthGraphics.fillStyle(0x333333, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = this.healthBarX + i * (this.barWidth + this.barGap);
      this.healthGraphics.fillRect(x, this.healthBarY, this.barWidth, this.barHeight);
    }

    // 绘制当前血量（橙色）
    this.healthGraphics.fillStyle(0xff8800, 1);
    for (let i = 0; i < this.health; i++) {
      const x = this.healthBarX + i * (this.barWidth + this.barGap);
      this.healthGraphics.fillRect(x, this.healthBarY, this.barWidth, this.barHeight);
    }

    // 绘制边框
    this.healthGraphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < this.maxHealth; i++) {
      const x = this.healthBarX + i * (this.barWidth + this.barGap);
      this.healthGraphics.strokeRect(x, this.healthBarY, this.barWidth, this.barHeight);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    this.health = Math.max(0, this.health - 1);

    // 更新血条显示
    this.drawHealthBar();

    // 更新血量文本
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.onGameOver();
    }
  }

  onGameOver() {
    this.gameOver = true;

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 隐藏提示文本
    this.instructionText.setVisible(false);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出状态信号到控制台（用于验证）
    console.log('Game Over! Final health:', this.health);
  }

  update(time, delta) {
    // 本游戏不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);