class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.health = 5; // 当前生命值
    this.maxHealth = 5; // 最大生命值
    this.healthBlocks = []; // 存储血条方块
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '按空格键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 450, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建4秒自动回血定时器
    this.healTimer = this.time.addEvent({
      delay: 4000, // 4秒
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建反馈文本（用于显示扣血/回血提示）
    this.feedbackText = this.add.text(400, 500, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 80;
    const blockHeight = 40;
    const blockSpacing = 10;
    const startX = 400 - (blockWidth * this.maxHealth + blockSpacing * (this.maxHealth - 1)) / 2;
    const startY = 300;

    // 创建5个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      
      // 创建方块背景（暗色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, startY, blockWidth, blockHeight);

      // 创建方块前景（红色，表示生命值）
      const foreground = this.add.graphics();
      foreground.fillStyle(0xff0000, 1);
      foreground.fillRect(x, startY, blockWidth, blockHeight);

      // 添加边框
      const border = this.add.graphics();
      border.lineStyle(2, 0xffffff, 1);
      border.strokeRect(x, startY, blockWidth, blockHeight);

      this.healthBlocks.push({
        background,
        foreground,
        border,
        x,
        y: startY,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血条方块的显示
    for (let i = 0; i < this.healthBlocks.length; i++) {
      const block = this.healthBlocks[i];
      block.foreground.clear();

      // 如果当前索引小于生命值，显示红色
      if (i < this.health) {
        block.foreground.fillStyle(0xff0000, 1);
        block.foreground.fillRect(block.x, block.y, block.width, block.height);
      } else {
        // 否则显示暗色（空血）
        block.foreground.fillStyle(0x333333, 1);
        block.foreground.fillRect(block.x, block.y, block.width, block.height);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
  }

  takeDamage(amount) {
    if (this.health > 0) {
      this.health = Math.max(0, this.health - amount);
      this.updateHealthBar();
      this.showFeedback(`-${amount} 生命值`, 0xff0000);
      
      if (this.health === 0) {
        this.showFeedback('生命值耗尽！', 0xff0000);
      }
    }
  }

  heal() {
    if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.updateHealthBar();
      this.showFeedback('+1 生命值', 0x00ff00);
    }
  }

  showFeedback(text, color) {
    this.feedbackText.setText(text);
    this.feedbackText.setColor(`#${color.toString(16).padStart(6, '0')}`);
    
    // 清除之前的渐隐动画
    this.tweens.killTweensOf(this.feedbackText);
    
    // 重置透明度
    this.feedbackText.setAlpha(1);
    
    // 1秒后淡出
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: this.feedbackText,
        alpha: 0,
        duration: 500
      });
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
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