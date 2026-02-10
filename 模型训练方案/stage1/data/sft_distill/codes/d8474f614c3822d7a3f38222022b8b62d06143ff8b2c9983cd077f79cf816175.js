class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 15;
    this.currentHealth = 15;
    this.healthBarX = 100;
    this.healthBarY = 100;
    this.cellWidth = 30;
    this.cellHeight = 40;
    this.cellGap = 5;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(100, 50, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建提示文本
    this.add.text(100, 200, 'Right Click to take damage', {
      fontSize: '18px',
      color: '#aaaaaa'
    });

    // 初始绘制血条
    this.drawHealthBar();

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器 - 每1.5秒回复1点生命值
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息文本
    this.debugText = this.add.text(100, 250, '', {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = this.healthBarX + i * (this.cellWidth + this.cellGap);
      const y = this.healthBarY;

      // 判断当前格子是否有血量
      if (i < this.currentHealth) {
        // 有血量 - 绘制红色
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x, y, this.cellWidth, this.cellHeight);
        
        // 添加高光效果
        this.healthBarGraphics.fillStyle(0xff6666, 0.5);
        this.healthBarGraphics.fillRect(x, y, this.cellWidth, this.cellHeight / 3);
      } else {
        // 没有血量 - 绘制灰色
        this.healthBarGraphics.fillStyle(0x444444, 1);
        this.healthBarGraphics.fillRect(x, y, this.cellWidth, this.cellHeight);
      }

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x000000, 1);
      this.healthBarGraphics.strokeRect(x, y, this.cellWidth, this.cellHeight);
    }
  }

  /**
   * 扣血
   * @param {number} amount - 扣除的血量
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateDisplay();
      this.showDamageEffect();
      
      // 更新调试信息
      this.debugText.setText(`Took ${amount} damage!`);
      this.time.delayedCall(1000, () => {
        this.debugText.setText('');
      });
    }
  }

  /**
   * 回血
   */
  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateDisplay();
      this.showHealEffect();
      
      // 更新调试信息
      this.debugText.setText('Healed 1 HP!');
      this.debugText.setColor('#00ff00');
      this.time.delayedCall(1000, () => {
        this.debugText.setText('');
      });
    }
  }

  /**
   * 更新显示
   */
  updateDisplay() {
    this.drawHealthBar();
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  /**
   * 显示受伤效果
   */
  showDamageEffect() {
    // 创建红色闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(0xff0000, 0.3);
    flash.fillRect(0, 0, 800, 600);
    
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  /**
   * 显示治疗效果
   */
  showHealEffect() {
    // 创建绿色粒子效果
    const particle = this.add.graphics();
    particle.fillStyle(0x00ff00, 1);
    particle.fillCircle(0, 0, 8);
    
    const startX = this.healthBarX + (this.currentHealth - 1) * (this.cellWidth + this.cellGap) + this.cellWidth / 2;
    const startY = this.healthBarY + this.cellHeight / 2;
    
    particle.setPosition(startX, startY);
    
    this.tweens.add({
      targets: particle,
      y: startY - 50,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        particle.destroy();
      }
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
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, HealthBarScene };
}