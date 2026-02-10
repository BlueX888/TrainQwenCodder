class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化生命值
    this.currentHealth = this.maxHealth;

    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '点击鼠标左键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条图形对象
    this.healthBarGraphics = this.add.graphics();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 初始绘制血条
    this.updateHealthBar();

    // 监听鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每4秒触发一次，循环执行）
    this.regenTimer = this.time.addEvent({
      delay: 4000,              // 4秒
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true                // 循环执行
    });

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.updateDebugInfo();
  }

  update(time, delta) {
    // 更新调试信息（显示下次回血倒计时）
    if (this.regenTimer) {
      const remaining = this.regenTimer.getRemaining();
      this.debugText.setText([
        `当前生命值: ${this.currentHealth}/${this.maxHealth}`,
        `下次回血倒计时: ${(remaining / 1000).toFixed(1)}秒`,
        `定时器已触发次数: ${this.regenTimer.repeatCount}`
      ]);
    }
  }

  /**
   * 扣除生命值
   */
  takeDamage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();
    this.updateDebugInfo();

    // 如果生命值归零，显示提示
    if (this.currentHealth === 0) {
      this.showMessage('生命值已耗尽！', 0xff0000);
    }
  }

  /**
   * 回复生命值
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateDebugInfo();
      this.showMessage('+1 HP', 0x00ff00);
    }
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    const barWidth = 40;      // 每格血条宽度
    const barHeight = 30;     // 血条高度
    const barSpacing = 5;     // 血条间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 200;

    // 清空之前的绘制
    this.healthBarGraphics.clear();

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 有血：红色填充
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        // 无血：深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }

    // 更新生命值文本
    this.healthText.setText(`${this.currentHealth} / ${this.maxHealth}`);
  }

  /**
   * 更新调试信息
   */
  updateDebugInfo() {
    // 在 update 方法中实时更新
  }

  /**
   * 显示浮动消息
   */
  showMessage(text, color) {
    const message = this.add.text(400, 300, text, {
      fontSize: '20px',
      color: '#' + color.toString(16).padStart(6, '0')
    }).setOrigin(0.5);

    // 添加淡出动画
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 280,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        message.destroy();
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);