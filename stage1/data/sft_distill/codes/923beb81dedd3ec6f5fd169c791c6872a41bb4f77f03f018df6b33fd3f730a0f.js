class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 8; // 初始生命值
    this.maxHealth = 8; // 最大生命值
    this.healthBars = []; // 存储血条格子
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Press WASD to take damage', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建提示文本
    this.add.text(400, 500, 'Each WASD key press reduces 1 health', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 200; // 起始 X 坐标
    const startY = 100; // 起始 Y 坐标
    const barWidth = 40; // 每格宽度
    const barHeight = 30; // 每格高度
    const gap = 5; // 格子间距

    // 创建 8 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      const y = startY;

      // 创建血条格子的 Graphics 对象
      const bar = this.add.graphics();
      
      // 绘制紫色填充
      bar.fillStyle(0x9933ff, 1); // 紫色
      bar.fillRect(x, y, barWidth, barHeight);
      
      // 绘制边框
      bar.lineStyle(2, 0x6600cc, 1); // 深紫色边框
      bar.strokeRect(x, y, barWidth, barHeight);

      // 存储格子信息
      this.healthBars.push({
        graphics: bar,
        x: x,
        y: y,
        width: barWidth,
        height: barHeight,
        active: true
      });
    }
  }

  setupInput() {
    // 创建 WASD 键
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.input.keyboard.on('keydown-W', () => this.takeDamage());
    this.input.keyboard.on('keydown-A', () => this.takeDamage());
    this.input.keyboard.on('keydown-S', () => this.takeDamage());
    this.input.keyboard.on('keydown-D', () => this.takeDamage());
  }

  takeDamage() {
    // 如果游戏已结束，不处理输入
    if (this.gameOver) {
      return;
    }

    // 如果还有生命值，扣血
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
    const lostHealth = this.maxHealth - this.health;
    
    // 从右向左更新血条（最新损失的在最右边）
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      const shouldBeGray = i >= this.health;

      if (shouldBeGray && bar.active) {
        // 将这格血条变灰
        bar.graphics.clear();
        bar.graphics.fillStyle(0x444444, 1); // 灰色
        bar.graphics.fillRect(bar.x, bar.y, bar.width, bar.height);
        bar.graphics.lineStyle(2, 0x222222, 1); // 深灰色边框
        bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);
        bar.active = false;
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

    // 禁用键盘输入
    this.input.keyboard.enabled = false;

    console.log('Game Over! Final Health:', this.health);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
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