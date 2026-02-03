class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 显示标题
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示操作提示
    this.add.text(400, 150, '点击鼠标左键扣血，每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage();
      }
    });

    // 创建自动回血定时器（每2秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 显示定时器状态文本
    this.timerText = this.add.text(400, 500, '下次回血: 2.0秒', {
      fontSize: '18px',
      color: '#88ff88'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新定时器显示
    if (this.healTimer) {
      const remaining = this.healTimer.getRemaining() / 1000;
      this.timerText.setText(`下次回血: ${remaining.toFixed(1)}秒`);
    }
  }

  createHealthBar() {
    const barWidth = 80;
    const barHeight = 80;
    const barSpacing = 20;
    const startX = 400 - (barWidth * 1.5 + barSpacing);
    const startY = 250;

    // 创建3个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(4, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 血条填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 4, startY + 4, barWidth - 8, barHeight - 8);

      this.healthBars.push({
        background: background,
        fill: fill,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();

      if (i < this.currentHealth) {
        // 有血：显示红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 4, bar.y + 4, bar.width - 8, bar.height - 8);
      } else {
        // 无血：显示深灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 4, bar.y + 4, bar.width - 8, bar.height - 8);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();

      // 创建扣血提示
      const damageText = this.add.text(400, 350, '-1', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 扣血动画
      this.tweens.add({
        targets: damageText,
        y: 300,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          damageText.destroy();
        }
      });

      console.log(`受到伤害！当前生命值: ${this.currentHealth}`);
    } else {
      console.log('生命值已为0，无法继续扣血');
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();

      // 创建回血提示
      const healText = this.add.text(400, 350, '+1', {
        fontSize: '48px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 回血动画
      this.tweens.add({
        targets: healText,
        y: 300,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          healText.destroy();
        }
      });

      console.log(`自动回血！当前生命值: ${this.currentHealth}`);
    } else {
      console.log('生命值已满，无需回血');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

new Phaser.Game(config);