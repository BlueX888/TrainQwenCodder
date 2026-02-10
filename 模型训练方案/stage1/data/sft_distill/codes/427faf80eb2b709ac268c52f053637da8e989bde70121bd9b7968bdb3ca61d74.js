class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBlocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 100, '点击鼠标左键扣血 | 每4秒自动回复1点', {
      fontSize: '16px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    const startX = 200;
    const startY = 200;
    const blockWidth = 40;
    const blockHeight = 60;
    const spacing = 5;

    // 创建10个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + spacing);
      const y = startY;

      // 创建方块背景（边框）
      const border = this.add.graphics();
      border.lineStyle(2, 0x666666, 1);
      border.strokeRect(x, y, blockWidth, blockHeight);

      // 创建方块填充
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        border: border,
        fill: fill,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight
      });
    }

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 300, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器，每4秒执行一次
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 添加定时器状态文本
    this.timerText = this.add.text(400, 350, '下次回血: 4.0秒', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 添加操作提示
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新定时器倒计时显示
    if (this.healTimer) {
      const remaining = this.healTimer.getRemaining() / 1000;
      this.timerText.setText(`下次回血: ${remaining.toFixed(1)}秒`);
    }
  }

  // 扣血函数
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.showStatus(`受到伤害 -${amount}`, 0xff0000);
      
      if (this.currentHealth === 0) {
        this.showStatus('生命值耗尽！', 0xff0000);
      }
    }
  }

  // 自动回血函数
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.showStatus('回复生命 +1', 0x00ff00);
    }
  }

  // 更新血条显示
  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.fill.clear();
      
      if (i < this.currentHealth) {
        // 有生命值：红色
        block.fill.fillStyle(0xff0000, 1);
      } else {
        // 无生命值：深灰色
        block.fill.fillStyle(0x333333, 1);
      }
      
      block.fill.fillRect(
        block.x + 2,
        block.y + 2,
        block.width - 4,
        block.height - 4
      );
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  // 显示状态消息
  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 1秒后清除消息
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });
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
const game = new Phaser.Game(config);