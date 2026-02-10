class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
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
    this.add.text(400, 100, '按方向键扣血 | 每1.5秒自动回复1点', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 防止按键重复触发的标志
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 创建自动回血定时器（每1.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建提示文本
    this.messageText = this.add.text(400, 450, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 50;
    const blockHeight = 50;
    const gap = 10;

    // 清空旧的血块
    this.healthBlocks.forEach(block => block.destroy());
    this.healthBlocks = [];

    // 绘制血条背景（灰色边框）
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 绘制背景边框
      const bg = this.add.graphics();
      bg.lineStyle(3, 0x666666, 1);
      bg.strokeRect(x, y, blockWidth, blockHeight);
      this.healthBlocks.push(bg);
    }

    // 绘制当前生命值（红色方块）
    this.updateHealthBar();
  }

  updateHealthBar() {
    const startX = 200;
    const startY = 250;
    const blockWidth = 50;
    const blockHeight = 50;
    const gap = 10;

    // 清除旧的生命值方块（保留背景）
    if (this.healthFillBlocks) {
      this.healthFillBlocks.forEach(block => block.destroy());
    }
    this.healthFillBlocks = [];

    // 绘制当前生命值
    for (let i = 0; i < this.currentHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 3, y + 3, blockWidth - 6, blockHeight - 6);
      this.healthFillBlocks.push(fill);
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 2) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 4) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  takeDamage(amount = 1) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.showMessage(`受到伤害！-${amount}`, '#ff0000');

      if (this.currentHealth === 0) {
        this.showMessage('生命值耗尽！', '#ff0000');
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.showMessage('自动回复 +1', '#00ff00');
    }
  }

  showMessage(text, color) {
    this.messageText.setText(text);
    this.messageText.setColor(color);

    // 清除之前的淡出动画
    this.tweens.killTweensOf(this.messageText);

    // 重置透明度
    this.messageText.setAlpha(1);

    // 2秒后淡出消息
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: this.messageText,
        alpha: 0,
        duration: 500
      });
    });
  }

  update(time, delta) {
    // 检测方向键按下（防止连续触发）
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.keyPressed.up = true;
      this.takeDamage(1);
    }
    if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.keyPressed.down = true;
      this.takeDamage(1);
    }
    if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.keyPressed.left = true;
      this.takeDamage(1);
    }
    if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.keyPressed.right = true;
      this.takeDamage(1);
    }
    if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);