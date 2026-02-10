class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化生命值
    this.currentHealth = this.maxHealth;

    // 创建血条Graphics对象
    this.healthBarGraphics = this.add.graphics();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 500, '', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press WASD to take damage', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto regenerate 1 HP every 1.5 seconds', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 初始绘制血条
    this.drawHealthBar();

    // 设置键盘输入监听
    this.setupKeyboardInput();

    // 创建自动回血定时器（每1.5秒触发一次，循环执行）
    this.regenTimer = this.time.addEvent({
      delay: 1500,           // 1.5秒
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true             // 循环执行
    });
  }

  setupKeyboardInput() {
    // 创建WASD键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    keyW.on('down', () => this.takeDamage());
    keyA.on('down', () => this.takeDamage());
    keyS.on('down', () => this.takeDamage());
    keyD.on('down', () => this.takeDamage());
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth -= 1;
      this.drawHealthBar();
      
      // 添加受伤反馈效果
      this.cameras.main.shake(100, 0.005);
    }
  }

  regenerateHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth += 1;
      this.drawHealthBar();
      
      // 添加回血反馈效果（轻微闪烁）
      this.cameras.main.flash(200, 0, 255, 0, false, 0.3);
    }
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    // 血条配置
    const barWidth = 30;      // 每格宽度
    const barHeight = 40;     // 每格高度
    const barSpacing = 5;     // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing)) / 2;
    const startY = 250;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x333333, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 当前生命值：红色
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        // 损失的生命值：深灰色
        this.healthBarGraphics.fillStyle(0x444444, 1);
      }
      this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);

    // 根据生命值改变文本颜色
    if (this.currentHealth <= 5) {
      this.healthText.setColor('#ff0000'); // 低血量：红色
    } else if (this.currentHealth <= 10) {
      this.healthText.setColor('#ffaa00'); // 中等血量：橙色
    } else {
      this.healthText.setColor('#ffffff'); // 高血量：白色
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中血条更新在事件响应中完成
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);