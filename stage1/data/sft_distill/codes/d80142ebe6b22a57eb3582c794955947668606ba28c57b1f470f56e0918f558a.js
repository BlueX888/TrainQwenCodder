class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
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

    // 创建提示文本
    this.add.text(400, 100, '鼠标右键：扣血 | 每2.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
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

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每2.5秒触发一次）
    this.regenTimer = this.time.addEvent({
      delay: 2500,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
    this.updateDebugInfo();
  }

  update(time, delta) {
    // 更新调试信息
    this.updateDebugInfo();
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 30;  // 每格血条宽度
    const barHeight = 40; // 血条高度
    const gap = 5;        // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + gap) - gap) / 2; // 居中起始位置
    const startY = 200;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      // 绘制背景（灰色边框）
      this.healthBarGraphics.lineStyle(2, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 如果当前格子应该被填充（生命值未耗尽）
      if (i < this.currentHealth) {
        // 根据生命值比例改变颜色
        const healthPercent = this.currentHealth / this.maxHealth;
        let fillColor;
        if (healthPercent > 0.6) {
          fillColor = 0x00ff00; // 绿色（健康）
        } else if (healthPercent > 0.3) {
          fillColor = 0xffff00; // 黄色（警告）
        } else {
          fillColor = 0xff0000; // 红色（危险）
        }
        
        this.healthBarGraphics.fillStyle(fillColor, 1);
        this.healthBarGraphics.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  /**
   * 扣血逻辑
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      // 创建伤害提示
      const damageText = this.add.text(
        Phaser.Math.Between(300, 500),
        150,
        `-${amount}`,
        { fontSize: '32px', color: '#ff0000', fontStyle: 'bold' }
      ).setOrigin(0.5);

      // 伤害数字动画
      this.tweens.add({
        targets: damageText,
        y: 100,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          damageText.destroy();
        }
      });

      if (this.currentHealth === 0) {
        this.showGameOverMessage();
      }
    }
  }

  /**
   * 回血逻辑
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();

      // 创建回血提示
      const healText = this.add.text(
        Phaser.Math.Between(300, 500),
        150,
        '+1',
        { fontSize: '28px', color: '#00ff00', fontStyle: 'bold' }
      ).setOrigin(0.5);

      // 回血数字动画
      this.tweens.add({
        targets: healText,
        y: 100,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          healText.destroy();
        }
      });
    }
  }

  /**
   * 显示游戏结束消息
   */
  showGameOverMessage() {
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // 停止回血定时器
    if (this.regenTimer) {
      this.regenTimer.remove();
    }
  }

  /**
   * 更新调试信息
   */
  updateDebugInfo() {
    const timerProgress = this.regenTimer ? 
      (this.regenTimer.getElapsed() / this.regenTimer.delay * 100).toFixed(1) : 0;
    
    this.debugText.setText([
      `当前生命值: ${this.currentHealth}`,
      `最大生命值: ${this.maxHealth}`,
      `回血进度: ${timerProgress}%`,
      `定时器运行: ${this.regenTimer && !this.regenTimer.paused ? 'Yes' : 'No'}`
    ]);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);