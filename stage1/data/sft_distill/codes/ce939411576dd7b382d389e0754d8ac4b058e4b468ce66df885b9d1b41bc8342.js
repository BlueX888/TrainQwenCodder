class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBlocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 添加标题
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加说明文字
    this.add.text(400, 100, '鼠标右键扣血 | 每2.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文字
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

    // 创建自动回血定时器 - 每2.5秒回复1点
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
    this.updateDebugInfo();
  }

  createHealthBar() {
    const blockWidth = 30;
    const blockHeight = 40;
    const blockSpacing = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + blockSpacing)) / 2;
    const startY = 300;

    // 创建20个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景框（灰色边框）
      const bg = this.add.graphics();
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRect(x, y, blockWidth, blockHeight);

      // 创建填充块（红色生命值）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: bg,
        fill: fill,
        x: x,
        y: y
      });
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.fill.clear();

      if (i < this.currentHealth) {
        // 根据生命值比例改变颜色
        let color = 0xff0000; // 红色
        if (this.currentHealth > this.maxHealth * 0.6) {
          color = 0x00ff00; // 绿色（健康）
        } else if (this.currentHealth > this.maxHealth * 0.3) {
          color = 0xffff00; // 黄色（警告）
        }

        block.fill.fillStyle(color, 1);
        block.fill.fillRect(
          block.x + 2,
          block.y + 2,
          block.background.width - 4,
          block.background.height - 4
        );
      }
    }

    // 更新文字显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    this.updateDebugInfo();
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();

      // 添加受伤闪烁效果
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

      // 添加治疗提示
      const healText = this.add.text(400, 400, '+1', {
        fontSize: '24px',
        color: '#00ff00'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: healText,
        y: 350,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          healText.destroy();
        }
      });
    }
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 400, '生命值耗尽！', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    // 停止回血定时器
    if (this.healTimer) {
      this.healTimer.paused = true;
    }

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  updateDebugInfo() {
    const timerProgress = this.healTimer ? 
      ((this.healTimer.elapsed / this.healTimer.delay) * 100).toFixed(1) : 0;
    
    this.debugText.setText([
      `当前生命: ${this.currentHealth}/${this.maxHealth}`,
      `回血进度: ${timerProgress}%`,
      `定时器状态: ${this.healTimer && !this.healTimer.paused ? '运行中' : '已停止'}`
    ]);
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