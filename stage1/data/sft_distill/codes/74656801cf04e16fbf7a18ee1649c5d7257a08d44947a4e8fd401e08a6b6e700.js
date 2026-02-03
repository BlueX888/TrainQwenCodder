class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.regenTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化生命值
    this.currentHealth = this.maxHealth;

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'Auto heal 1 HP every 4 seconds', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值数字显示
    this.healthText = this.add.text(400, 250, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    this.updateHealthBar();

    // 监听空格键
    this.input.keyboard.on('keydown-SPACE', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每 4 秒触发一次）
    this.regenTimer = this.time.addEvent({
      delay: 4000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffff00'
    });
    this.updateDebugText();
  }

  update(time, delta) {
    // 更新调试信息（显示下次回血倒计时）
    if (this.regenTimer) {
      const remaining = (this.regenTimer.getRemaining() / 1000).toFixed(1);
      this.debugText.setText(`Next heal in: ${remaining}s`);
    }
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 60;
    const barHeight = 40;
    const spacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + spacing)) / 2;
    const startY = 300;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 判断当前格子是否有血
      if (i < this.currentHealth) {
        // 有血：红色填充
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        // 无血：深灰色填充
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }
      
      // 绘制血条方块
      this.healthBarGraphics.fillRect(x, startY, barWidth, barHeight);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(2, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);
    }
  }

  /**
   * 受到伤害
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateDebugText();

      // 显示伤害反馈
      const damageText = this.add.text(400, 400, `-${amount} HP`, {
        fontSize: '28px',
        color: '#ff0000'
      }).setOrigin(0.5);

      // 伤害文字动画
      this.tweens.add({
        targets: damageText,
        y: 350,
        alpha: 0,
        duration: 1000,
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
   * 自动回血
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateHealthText();
      this.updateDebugText();

      // 显示回血反馈
      const healText = this.add.text(400, 400, '+1 HP', {
        fontSize: '28px',
        color: '#00ff00'
      }).setOrigin(0.5);

      // 回血文字动画
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

  /**
   * 更新生命值文本
   */
  updateHealthText() {
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变颜色
    if (this.currentHealth === 0) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 2) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  /**
   * 更新调试信息
   */
  updateDebugText() {
    // 在 update 中更新倒计时
  }

  /**
   * 显示游戏结束消息
   */
  showGameOverMessage() {
    const gameOverText = this.add.text(400, 500, 'GAME OVER - No Health Left!', {
      fontSize: '32px',
      color: '#ff0000'
    }).setOrigin(0.5);

    // 停止自动回血
    if (this.regenTimer) {
      this.regenTimer.paused = true;
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
game.getHealth = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.currentHealth : 0;
};