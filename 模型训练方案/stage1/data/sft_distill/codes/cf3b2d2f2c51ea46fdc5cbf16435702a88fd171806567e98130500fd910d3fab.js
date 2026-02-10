class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBlocks = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文字
    this.add.text(400, 100, '右键点击扣血 | 每1.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每1.5秒）
    this.time.addEvent({
      delay: 1500,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加状态指示器（用于验证）
    this.statusText = this.add.text(10, 10, 'Status: Running', {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  createHealthBar() {
    const startX = 150;
    const startY = 250;
    const blockWidth = 30;
    const blockHeight = 40;
    const blockSpacing = 5;

    // 创建15个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景（空血槽）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, blockWidth, blockHeight);
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建前景（实际血量）
      const foreground = this.add.graphics();
      this.drawHealthBlock(foreground, x, y, blockWidth, blockHeight, true);

      this.healthBlocks.push({
        background,
        foreground,
        x,
        y,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  drawHealthBlock(graphics, x, y, width, height, isFilled) {
    graphics.clear();
    if (isFilled) {
      // 根据血量使用不同颜色
      let color;
      if (this.currentHealth > 10) {
        color = 0x00ff00; // 绿色（健康）
      } else if (this.currentHealth > 5) {
        color = 0xffff00; // 黄色（警告）
      } else {
        color = 0xff0000; // 红色（危险）
      }
      graphics.fillStyle(color, 1);
      graphics.fillRect(x + 2, y + 2, width - 4, height - 4);
    }
  }

  updateHealthBar() {
    // 更新每个血条格子的显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const isFilled = i < this.currentHealth;
      this.drawHealthBlock(block.foreground, block.x, block.y, block.width, block.height, isFilled);
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);

    // 更新文本颜色
    if (this.currentHealth > 10) {
      this.healthText.setColor('#00ff00');
    } else if (this.currentHealth > 5) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();

      // 创建伤害提示
      const damageText = this.add.text(400, 350, `-${amount}`, {
        fontSize: '32px',
        color: '#ff0000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 伤害数字上浮动画
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

      if (this.currentHealth === 0) {
        this.statusText.setText('Status: Dead').setColor('#ff0000');
      }
    }
  }

  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();

      // 创建回复提示
      const healText = this.add.text(400, 350, '+1', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 回复数字上浮动画
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
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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