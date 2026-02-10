class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBlocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按空格键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值数字显示
    this.healthText = this.add.text(400, 400, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每4秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建提示文本（显示定时器状态）
    this.timerText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#88ff88'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 60;
    const blockHeight = 40;
    const gap = 10;

    // 创建5个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const graphics = this.add.graphics();
      
      // 绘制边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(x, startY, blockWidth, blockHeight);
      
      // 绘制填充（初始全满）
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x + 3, startY + 3, blockWidth - 6, blockHeight - 6);
      
      this.healthBlocks.push({
        graphics: graphics,
        x: x,
        y: startY,
        width: blockWidth,
        height: blockHeight,
        filled: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示
    for (let i = 0; i < this.healthBlocks.length; i++) {
      const block = this.healthBlocks[i];
      block.graphics.clear();
      
      // 绘制边框
      block.graphics.lineStyle(3, 0xffffff, 1);
      block.graphics.strokeRect(block.x, block.y, block.width, block.height);
      
      // 根据当前生命值决定是否填充
      if (i < this.currentHealth) {
        block.graphics.fillStyle(0xff0000, 1);
        block.graphics.fillRect(
          block.x + 3,
          block.y + 3,
          block.width - 6,
          block.height - 6
        );
        block.filled = true;
      } else {
        // 空血条显示暗色
        block.graphics.fillStyle(0x330000, 0.3);
        block.graphics.fillRect(
          block.x + 3,
          block.y + 3,
          block.width - 6,
          block.height - 6
        );
        block.filled = false;
      }
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      
      // 显示扣血提示
      const damageText = this.add.text(400, 350, `-${amount}`, {
        fontSize: '32px',
        color: '#ff0000'
      }).setOrigin(0.5);
      
      // 扣血文字动画
      this.tweens.add({
        targets: damageText,
        y: 300,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          damageText.destroy();
        }
      });

      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      
      // 显示回血提示
      const healText = this.add.text(400, 350, '+1', {
        fontSize: '32px',
        color: '#00ff00'
      }).setOrigin(0.5);
      
      // 回血文字动画
      this.tweens.add({
        targets: healText,
        y: 300,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          healText.destroy();
        }
      });
    }
  }

  updateHealthText() {
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 500, '生命值耗尽！等待回血...', {
      fontSize: '24px',
      color: '#ff0000'
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
    // 更新定时器进度显示
    if (this.healTimer) {
      const progress = this.healTimer.getProgress();
      const remaining = this.healTimer.getRemaining() / 1000;
      this.timerText.setText(`下次回血: ${remaining.toFixed(1)}秒`);
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