class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '点击鼠标左键扣血，每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBars();

    // 创建生命值显示文本（用于验证状态）
    this.healthText = this.add.text(400, 450, `当前生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建自动回血定时器（每2秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建提示文本显示回血倒计时
    this.timerText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);
  }

  createHealthBars() {
    const barWidth = 80;
    const barHeight = 40;
    const barSpacing = 20;
    const startX = 400 - (barWidth * 1.5 + barSpacing);
    const startY = 300;

    // 创建3个血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({ background, fill, x, y: startY });
    }
  }

  updateHealthBars() {
    // 更新每个血条的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();
      
      if (i < this.currentHealth) {
        // 有血：显示红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, 74, 34);
      } else {
        // 无血：显示深灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, 74, 34);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`当前生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBars();
      
      // 添加扣血反馈效果
      this.cameras.main.shake(100, 0.005);
      
      console.log(`受到伤害！当前生命值: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        this.showGameOverMessage();
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBars();
      
      // 添加回血反馈效果（绿色闪烁）
      this.cameras.main.flash(200, 0, 255, 0);
      
      console.log(`回复生命！当前生命值: ${this.currentHealth}`);
    }
  }

  showGameOverMessage() {
    const gameOverText = this.add.text(400, 250, '生命值耗尽！', {
      fontSize: '36px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  update(time, delta) {
    // 更新回血倒计时显示
    if (this.healTimer && this.currentHealth < this.maxHealth) {
      const remaining = this.healTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(1);
      this.timerText.setText(`下次回血倒计时: ${seconds}秒`);
      this.timerText.setColor('#00ff00');
    } else if (this.currentHealth >= this.maxHealth) {
      this.timerText.setText('生命值已满');
      this.timerText.setColor('#ffff00');
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);