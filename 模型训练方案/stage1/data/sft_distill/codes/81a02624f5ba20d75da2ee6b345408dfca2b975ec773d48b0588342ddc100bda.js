class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
    this.healthBars = [];
    this.gameOver = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建显示当前血量的文本
    this.healthText = this.add.text(400, 350, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 200;

    // 创建 10 个血格
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.add.graphics();
      
      // 绘制白色边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(0, 0, barWidth, barHeight);
      
      // 绘制白色填充
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(2, 2, barWidth - 4, barHeight - 4);
      
      // 设置位置
      graphics.setPosition(startX + i * (barWidth + barSpacing), startY);
      
      // 保存到数组中以便后续更新
      this.healthBars.push(graphics);
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理输入
    if (this.gameOver) {
      return;
    }

    // 扣除生命值
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const graphics = this.healthBars[i];
      graphics.clear();
      
      if (i < this.health) {
        // 剩余的血量：白色
        graphics.lineStyle(3, 0xffffff, 1);
        graphics.strokeRect(0, 0, 50, 30);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(2, 2, 46, 26);
      } else {
        // 已损失的血量：深灰色边框 + 暗灰色填充
        graphics.lineStyle(3, 0x666666, 1);
        graphics.strokeRect(0, 0, 50, 30);
        graphics.fillStyle(0x333333, 0.5);
        graphics.fillRect(2, 2, 46, 26);
      }
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
    this.spaceKey.off('down', this.takeDamage, this);
    
    // 添加重启提示
    this.add.text(400, 400, 'Refresh to restart', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

new Phaser.Game(config);