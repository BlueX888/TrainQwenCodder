class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBars = [];
    this.canTakeDamage = true;
    this.damageCooldown = 300; // 防止连续扣血的冷却时间（毫秒）
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto Heal: +1 HP every 1.5 seconds', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 350, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器（每 1.5 秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加状态信息文本（用于验证）
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    this.updateStatusText();
  }

  createHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 200;

    // 创建 8 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;

      // 创建背景边框
      const border = this.add.graphics();
      border.lineStyle(2, 0x333333, 1);
      border.strokeRect(x, y, barWidth, barHeight);

      // 创建血条填充
      const healthBar = this.add.graphics();
      this.healthBars.push(healthBar);
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    const barWidth = 50;
    const barHeight = 30;
    const barSpacing = 10;
    const startX = 400 - (this.maxHealth * (barWidth + barSpacing) - barSpacing) / 2;
    const startY = 200;

    // 更新每个血条格子的显示
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + barSpacing);
      const y = startY;
      const healthBar = this.healthBars[i];

      healthBar.clear();

      if (i < this.currentHealth) {
        // 满血格子 - 红色
        healthBar.fillStyle(0xff0000, 1);
        healthBar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
      } else {
        // 空血格子 - 深灰色
        healthBar.fillStyle(0x444444, 1);
        healthBar.fillRect(x + 2, y + 2, barWidth - 4, barHeight - 4);
      }
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage() {
    if (!this.canTakeDamage || this.currentHealth <= 0) {
      return;
    }

    this.currentHealth = Math.max(0, this.currentHealth - 1);
    this.updateHealthBar();
    this.updateStatusText();

    // 设置冷却
    this.canTakeDamage = false;
    this.time.delayedCall(this.damageCooldown, () => {
      this.canTakeDamage = true;
    });

    // 显示伤害反馈
    this.showDamageEffect();

    // 检查是否死亡
    if (this.currentHealth === 0) {
      this.showGameOver();
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.updateStatusText();

      // 显示治疗效果
      this.showHealEffect();
    }
  }

  showDamageEffect() {
    const damageText = this.add.text(400, 280, '-1', {
      fontSize: '28px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: 250,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }

  showHealEffect() {
    const healText = this.add.text(400, 280, '+1', {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: healText,
      y: 250,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        healText.destroy();
      }
    });
  }

  showGameOver() {
    const gameOverText = this.add.text(400, 400, 'GAME OVER!', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    gameOverText.setAlpha(0);
    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  }

  updateStatusText() {
    const timerProgress = this.healTimer.getProgress();
    const timeToNextHeal = ((1 - timerProgress) * 1.5).toFixed(1);
    
    this.statusText.setText(
      `Status: HP=${this.currentHealth}/${this.maxHealth} | ` +
      `Next Heal: ${timeToNextHeal}s | ` +
      `Can Damage: ${this.canTakeDamage}`
    );
  }

  update(time, delta) {
    // 检测方向键输入
    if (this.cursors.up.isDown || 
        this.cursors.down.isDown || 
        this.cursors.left.isDown || 
        this.cursors.right.isDown) {
      this.takeDamage();
    }

    // 更新状态文本
    this.updateStatusText();
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