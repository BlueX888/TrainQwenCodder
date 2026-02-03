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
    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '右键点击扣血 | 每1.5秒自动回复1点', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 500, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建回血定时器 - 每1.5秒回复1点生命值
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建状态指示文本
    this.statusText = this.add.text(400, 450, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 40;
    const blockHeight = 30;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap)) / 2;
    const startY = 250;

    // 创建15个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建背景方块（灰色）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, y, blockWidth, blockHeight);

      // 创建生命值方块（红色）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff0000, 1);
      healthBlock.fillRect(x, y, blockWidth, blockHeight);

      // 添加边框
      const border = this.add.graphics();
      border.lineStyle(2, 0x666666, 1);
      border.strokeRect(x, y, blockWidth, blockHeight);

      this.healthBlocks.push({
        background,
        healthBlock,
        border,
        visible: true
      });
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.showStatus('受到伤害!', '#ff0000');
      
      if (this.currentHealth === 0) {
        this.showStatus('生命值耗尽!', '#ff0000');
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.showStatus('回复生命值!', '#00ff00');
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      if (i < this.currentHealth) {
        // 显示生命值方块
        block.healthBlock.setAlpha(1);
      } else {
        // 隐藏生命值方块
        block.healthBlock.setAlpha(0);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
    
    // 状态文本淡出效果
    this.tweens.add({
      targets: this.statusText,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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
const game = new Phaser.Game(config);

// 导出状态变量供验证
game.getHealth = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.currentHealth : 0;
};

game.getMaxHealth = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.maxHealth : 0;
};