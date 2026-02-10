class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.healthBarGraphics = null;
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      lastAction: 'init',
      timestamp: Date.now()
    };

    // 绘制标题
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 绘制操作提示
    this.add.text(400, 100, '鼠标右键：扣血 | 每2.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 显示当前血量文字
    this.healthText = this.add.text(400, 350, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建自动回血定时器（每2.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 显示日志区域
    this.logText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateLog('游戏开始');
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 40; // 每格宽度
    const barHeight = 50; // 每格高度
    const spacing = 5; // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + spacing)) / 2; // 居中起始X
    const startY = 200;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      const y = startY;

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x333333, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);

      // 绘制填充（红色表示有血，灰色表示失血）
      if (i < this.currentHealth) {
        // 当前血量：红色渐变
        const gradient = i / this.maxHealth;
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          { r: 255, g: 0, b: 0 },
          { r: 255, g: 100, b: 100 },
          this.maxHealth,
          i
        );
        const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
        this.healthBarGraphics.fillStyle(hexColor, 1);
      } else {
        // 失去的血量：深灰色
        this.healthBarGraphics.fillStyle(0x444444, 1);
      }

      this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }
  }

  /**
   * 扣血
   */
  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthDisplay();
      this.updateLog(`受到伤害！当前血量: ${this.currentHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.lastAction = 'damage';
      window.__signals__.timestamp = Date.now();
      
      console.log(JSON.stringify({
        action: 'takeDamage',
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    } else {
      this.updateLog('已经没有生命值了！');
    }
  }

  /**
   * 自动回血
   */
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthDisplay();
      this.updateLog(`自动回复！当前血量: ${this.currentHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.lastAction = 'heal';
      window.__signals__.timestamp = Date.now();
      
      console.log(JSON.stringify({
        action: 'autoHeal',
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    }
  }

  /**
   * 更新血条显示
   */
  updateHealthDisplay() {
    this.drawHealthBar();
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  /**
   * 更新日志显示
   */
  updateLog(message) {
    this.logText.setText(message);
    
    // 1秒后清除日志
    this.time.delayedCall(1000, () => {
      this.logText.setText('');
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
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
new Phaser.Game(config);