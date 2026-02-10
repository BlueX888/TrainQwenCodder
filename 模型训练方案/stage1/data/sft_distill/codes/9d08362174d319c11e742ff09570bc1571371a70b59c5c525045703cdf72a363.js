class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.healTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建操作提示
    this.add.text(400, 100, '右键点击扣血 | 每2.5秒自动回复1点', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本
    this.healthText = this.add.text(400, 450, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 初始化血条显示
    this.updateHealthBar();

    // 监听鼠标右键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每2.5秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 2500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.add.text(10, 10, '调试信息:', {
      fontSize: '16px',
      color: '#00ff00'
    });

    this.debugText = this.add.text(10, 35, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    this.updateDebugInfo();
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();

    const cellWidth = 30;
    const cellHeight = 40;
    const cellGap = 5;
    const cellsPerRow = 10;
    const startX = 400 - (cellsPerRow * (cellWidth + cellGap) - cellGap) / 2;
    const startY = 200;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const row = Math.floor(i / cellsPerRow);
      const col = i % cellsPerRow;
      const x = startX + col * (cellWidth + cellGap);
      const y = startY + row * (cellHeight + cellGap);

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, y, cellWidth, cellHeight);

      // 根据当前生命值填充颜色
      if (i < this.currentHealth) {
        // 根据生命值比例显示不同颜色
        const healthRatio = this.currentHealth / this.maxHealth;
        let fillColor;
        if (healthRatio > 0.6) {
          fillColor = 0x00ff00; // 绿色（健康）
        } else if (healthRatio > 0.3) {
          fillColor = 0xffff00; // 黄色（警告）
        } else {
          fillColor = 0xff0000; // 红色（危险）
        }
        
        this.healthBarGraphics.fillStyle(fillColor, 1);
        this.healthBarGraphics.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      } else {
        // 空血条显示暗色
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);

    // 更新调试信息
    this.updateDebugInfo();
  }

  /**
   * 扣血
   * @param {number} amount - 扣除的生命值
   */
  takeDamage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();

    // 添加视觉反馈
    this.cameras.main.shake(100, 0.005);

    // 如果生命值为0，显示提示
    if (this.currentHealth === 0) {
      this.showMessage('生命值已耗尽！', 0xff0000);
    }
  }

  /**
   * 回血
   */
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();

      // 显示回血提示
      this.showMessage('+1 HP', 0x00ff00);
    }
  }

  /**
   * 显示浮动消息
   * @param {string} message - 消息内容
   * @param {number} color - 消息颜色
   */
  showMessage(message, color) {
    const text = this.add.text(400, 350, message, {
      fontSize: '28px',
      color: '#' + color.toString(16).padStart(6, '0')
    }).setOrigin(0.5);

    // 添加淡出动画
    this.tweens.add({
      targets: text,
      alpha: 0,
      y: 320,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
      }
    });
  }

  /**
   * 更新调试信息
   */
  updateDebugInfo() {
    if (this.debugText) {
      const elapsed = this.healTimer ? this.healTimer.getElapsed() : 0;
      const remaining = this.healTimer ? this.healTimer.getRemaining() : 0;
      
      this.debugText.setText(
        `当前生命值: ${this.currentHealth}\n` +
        `下次回血倒计时: ${(remaining / 1000).toFixed(1)}秒\n` +
        `定时器已运行: ${(elapsed / 1000).toFixed(1)}秒`
      );
    }
  }

  update(time, delta) {
    // 每帧更新调试信息
    this.updateDebugInfo();
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);