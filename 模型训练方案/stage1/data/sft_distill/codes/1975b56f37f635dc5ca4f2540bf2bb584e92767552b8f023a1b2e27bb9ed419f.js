class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化生命值
    this.currentHealth = this.maxHealth;

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '点击鼠标左键扣血 | 每2秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值数字显示
    this.healthText = this.add.text(400, 500, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 初始绘制血条
    this.drawHealthBar();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建自动回血定时器（每2秒回复1点）
    this.regenTimer = this.time.addEvent({
      delay: 2000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.add.text(10, 10, '状态监控:', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 创建实时状态显示
    this.statusText = this.add.text(10, 35, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    // 每帧更新状态显示
    this.events.on('update', () => {
      this.statusText.setText([
        `当前生命: ${this.currentHealth}/${this.maxHealth}`,
        `回血计时: ${(this.regenTimer.getRemaining() / 1000).toFixed(1)}s`,
        `血量百分比: ${((this.currentHealth / this.maxHealth) * 100).toFixed(0)}%`
      ]);
    });
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 30; // 每格宽度
    const barHeight = 40; // 每格高度
    const spacing = 5; // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + spacing)) / 2; // 居中起始X
    const startY = 200; // 起始Y位置

    // 绘制每一格生命值
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      const y = startY;

      // 绘制背景（空血槽）
      this.healthBarGraphics.fillStyle(0x333333, 1);
      this.healthBarGraphics.fillRect(x, y, barWidth, barHeight);

      // 如果当前格子有血，绘制血量
      if (i < this.currentHealth) {
        // 根据血量百分比改变颜色
        const healthPercent = this.currentHealth / this.maxHealth;
        let color;
        if (healthPercent > 0.6) {
          color = 0x00ff00; // 绿色（健康）
        } else if (healthPercent > 0.3) {
          color = 0xffff00; // 黄色（警告）
        } else {
          color = 0xff0000; // 红色（危险）
        }

        this.healthBarGraphics.fillStyle(color, 1);
        this.healthBarGraphics.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
      }

      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, y, barWidth, barHeight);
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);

    // 根据生命值改变文本颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    if (healthPercent > 0.6) {
      this.healthText.setColor('#00ff00');
    } else if (healthPercent > 0.3) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }
  }

  /**
   * 扣血
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.drawHealthBar();

      // 创建伤害提示
      const damageText = this.add.text(
        Phaser.Math.Between(300, 500),
        300,
        `-${amount}`,
        {
          fontSize: '32px',
          color: '#ff0000',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      // 伤害数字动画
      this.tweens.add({
        targets: damageText,
        y: 250,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          damageText.destroy();
        }
      });

      // 如果生命值归零
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  /**
   * 自动回血
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.drawHealthBar();

      // 创建回血提示
      const healText = this.add.text(
        Phaser.Math.Between(300, 500),
        300,
        '+1',
        {
          fontSize: '28px',
          color: '#00ff00',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      // 回血数字动画
      this.tweens.add({
        targets: healText,
        y: 250,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          healText.destroy();
        }
      });
    }
  }

  /**
   * 显示游戏结束
   */
  showGameOver() {
    const gameOverText = this.add.text(400, 350, 'Game Over!', {
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

    // 3秒后重启场景
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  // 可验证的状态信号通过 scene 的 currentHealth 变量暴露
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.currentHealth,
    maxHealth: scene.maxHealth,
    regenTimeRemaining: scene.regenTimer ? scene.regenTimer.getRemaining() : 0
  };
};