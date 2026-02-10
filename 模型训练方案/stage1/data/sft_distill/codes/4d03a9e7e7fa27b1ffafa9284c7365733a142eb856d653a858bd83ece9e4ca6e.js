class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 12; // 当前生命值
    this.maxHealth = 12; // 最大生命值
    this.healthBars = []; // 存储血条格子
    this.gameOver = false;
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
    this.createHealthBar();

    // 创建当前血量显示文本
    this.healthText = this.add.text(400, 250, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.takeDamage, this);

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 350, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 添加重启提示文本（初始隐藏）
    this.restartText = this.add.text(400, 420, 'Press R to Restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    // 监听 R 键重启
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.rKey.on('down', this.restart, this);
  }

  createHealthBar() {
    const barWidth = 40; // 每格血条宽度
    const barHeight = 30; // 血条高度
    const barSpacing = 5; // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2; // 居中起始位置
    const startY = 170;

    // 创建 12 格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const graphics = this.add.graphics();
      
      // 绘制橙色填充矩形
      graphics.fillStyle(0xff8800, 1); // 橙色
      graphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, startY, barWidth, barHeight);
      
      this.healthBars.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);

      // 检查是否死亡
      if (this.health <= 0) {
        this.showGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.graphics.clear();
      
      if (i < this.health) {
        // 显示橙色血条
        bar.graphics.fillStyle(0xff8800, 1);
        bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      } else {
        // 显示灰色空血条
        bar.graphics.fillStyle(0x333333, 1);
        bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
      }
      
      // 绘制边框
      bar.graphics.lineStyle(2, 0xffffff, 1);
      bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
    }
  }

  showGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);
    this.restartText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  restart() {
    if (this.gameOver) {
      // 重置游戏状态
      this.health = this.maxHealth;
      this.gameOver = false;
      this.gameOverText.setVisible(false);
      this.restartText.setVisible(false);
      this.tweens.killAll();
      this.gameOverText.setAlpha(1);
      
      // 重置血条显示
      this.updateHealthBar();
      this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    }
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