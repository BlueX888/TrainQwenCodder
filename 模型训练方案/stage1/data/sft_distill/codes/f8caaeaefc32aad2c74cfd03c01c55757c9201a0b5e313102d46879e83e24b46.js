class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBlocks = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文本
    this.add.text(400, 100, '点击鼠标左键扣血，每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条
    this.createHealthBar();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器，每2秒回复1点生命值
    this.healTimer = this.time.addEvent({
      delay: 2000, // 2秒
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息文本
    this.debugText = this.add.text(10, 550, '', {
      fontSize: '14px',
      color: '#ffff00'
    });

    this.updateDebugInfo();
  }

  createHealthBar() {
    const startX = 100;
    const startY = 250;
    const blockWidth = 30;
    const blockHeight = 40;
    const spacing = 2;

    // 创建20格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + spacing);
      const y = startY;

      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  updateHealthBar() {
    // 更新每格血条的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      if (i < this.currentHealth) {
        // 显示血量
        if (!block.active) {
          block.fill.clear();
          block.fill.fillStyle(0xff0000, 1);
          const startX = 100;
          const blockWidth = 30;
          const blockHeight = 40;
          const spacing = 2;
          const x = startX + i * (blockWidth + spacing);
          const y = 250;
          block.fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);
          block.active = true;
        }
      } else {
        // 隐藏血量
        if (block.active) {
          block.fill.clear();
          block.active = false;
        }
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 5) {
      this.healthText.setColor('#ff0000'); // 红色
    } else if (this.currentHealth <= 10) {
      this.healthText.setColor('#ffaa00'); // 橙色
    } else {
      this.healthText.setColor('#00ff00'); // 绿色
    }

    this.updateDebugInfo();
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      // 添加视觉反馈
      this.cameras.main.shake(100, 0.005);
      
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      
      // 添加治疗特效
      this.cameras.main.flash(200, 0, 255, 0, false);
    }
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 400, '生命值耗尽！', {
      fontSize: '48px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 停止回血定时器
    if (this.healTimer) {
      this.healTimer.paused = true;
    }

    // 3秒后重置游戏
    this.time.delayedCall(3000, () => {
      this.currentHealth = this.maxHealth;
      this.updateHealthBar();
      gameOverText.destroy();
      if (this.healTimer) {
        this.healTimer.paused = false;
      }
    });
  }

  updateDebugInfo() {
    const timerProgress = this.healTimer ? 
      (this.healTimer.getElapsed() / this.healTimer.delay * 100).toFixed(1) : 0;
    
    this.debugText.setText(
      `当前生命值: ${this.currentHealth}\n` +
      `下次回血进度: ${timerProgress}%\n` +
      `回血定时器状态: ${this.healTimer && !this.healTimer.paused ? '运行中' : '已暂停'}`
    );
  }

  update(time, delta) {
    // 每帧更新调试信息
    this.updateDebugInfo();
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