class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 10; // 可验证的状态信号
    this.maxHealth = 10;
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
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建显示当前血量的文本
    this.healthText = this.add.text(400, 350, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 450, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const totalWidth = (barWidth + barSpacing) * this.maxHealth - barSpacing;
    const startX = 400 - totalWidth / 2;
    const startY = 200;

    // 创建 10 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, startY, barWidth, barHeight);

      // 创建血条（橙色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff8800, 1); // 橙色
      healthBar.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      // 创建边框
      const border = this.add.graphics();
      border.lineStyle(2, 0xffffff, 1);
      border.strokeRect(x, startY, barWidth, barHeight);

      // 保存血条引用
      this.healthBars.push({
        bar: healthBar,
        background: background,
        border: border
      });
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再处理
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.health > 0) {
      this.health--;
      
      // 隐藏对应的血条格子
      const index = this.health;
      if (this.healthBars[index]) {
        this.healthBars[index].bar.setVisible(false);
      }

      // 更新血量文本
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 添加震动效果
      this.cameras.main.shake(100, 0.005);

      // 检查是否死亡
      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    
    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);
    
    // 添加文本闪烁效果
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
    this.add.text(400, 520, 'Refresh to restart', {
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加每帧更新的逻辑
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