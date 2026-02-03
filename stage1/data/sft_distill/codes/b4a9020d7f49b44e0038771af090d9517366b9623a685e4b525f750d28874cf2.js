class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBarGraphics = null;
    this.healthText = null;
    this.cursors = null;
    this.canTakeDamage = true;
    this.damageDelay = 200; // 防止连续扣血的延迟（毫秒）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 100, '生命值系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 150, '按方向键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthBarGraphics = this.add.graphics();
    
    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, '', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 初始化绘制血条
    this.updateHealthBar();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加额外的WASD键支持
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 设置自动回血计时器（每4秒触发一次）
    this.time.addEvent({
      delay: 4000,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.add.text(20, 20, '状态验证:', {
      fontSize: '16px',
      color: '#00ff00'
    });

    this.debugText = this.add.text(20, 45, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    this.updateDebugInfo();
  }

  update(time, delta) {
    // 检测方向键按下（包括WASD）
    if (this.canTakeDamage) {
      if (this.cursors.up.isDown || this.keyW.isDown ||
          this.cursors.down.isDown || this.keyS.isDown ||
          this.cursors.left.isDown || this.keyA.isDown ||
          this.cursors.right.isDown || this.keyD.isDown) {
        this.takeDamage(1);
      }
    }
  }

  /**
   * 扣除生命值
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.updateDebugInfo();

      // 设置扣血冷却，防止连续扣血
      this.canTakeDamage = false;
      this.time.delayedCall(this.damageDelay, () => {
        this.canTakeDamage = true;
      });

      // 死亡检测
      if (this.currentHealth === 0) {
        this.showGameOver();
      }
    }
  }

  /**
   * 自动回复生命值
   */
  regenerateHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateDebugInfo();
      
      // 显示回血提示
      const regenText = this.add.text(400, 350, '+1 HP', {
        fontSize: '20px',
        color: '#00ff00'
      }).setOrigin(0.5);

      // 回血文字淡出效果
      this.tweens.add({
        targets: regenText,
        alpha: 0,
        y: 320,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          regenText.destroy();
        }
      });
    }
  }

  /**
   * 更新血条显示
   */
  updateHealthBar() {
    this.healthBarGraphics.clear();

    const barWidth = 40;  // 每格血条宽度
    const barHeight = 40; // 每格血条高度
    const spacing = 8;    // 格子间距
    const startX = 400 - (this.maxHealth * (barWidth + spacing) - spacing) / 2; // 居中起始位置
    const startY = 300;

    // 绘制所有血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 绘制边框
      this.healthBarGraphics.lineStyle(3, 0x666666, 1);
      this.healthBarGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 如果当前格子有生命值，填充红色
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 空血格子填充深灰色
        this.healthBarGraphics.fillStyle(0x333333, 1);
        this.healthBarGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  /**
   * 更新调试信息
   */
  updateDebugInfo() {
    this.debugText.setText(
      `currentHealth: ${this.currentHealth}\n` +
      `maxHealth: ${this.maxHealth}\n` +
      `healthPercentage: ${((this.currentHealth / this.maxHealth) * 100).toFixed(1)}%`
    );
  }

  /**
   * 显示游戏结束
   */
  showGameOver() {
    const gameOverText = this.add.text(400, 450, '生命值耗尽！', {
      fontSize: '28px',
      color: '#ff0000'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 3秒后重置
    this.time.delayedCall(3000, () => {
      this.currentHealth = this.maxHealth;
      this.updateHealthBar();
      this.updateDebugInfo();
      gameOverText.destroy();
      this.canTakeDamage = true;
    });
  }
}

// Phaser 游戏配置
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