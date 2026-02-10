class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
    this.canTakeDamage = true;
    this.damageDelay = 200; // 防止连续扣血的延迟
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto Heal: +1 HP per second', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBars();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 350, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(400, 400, '', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器
    this.healTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#888888'
    });

    this.updateDebugInfo();
  }

  createHealthBars() {
    const startX = 250;
    const startY = 220;
    const barWidth = 80;
    const barHeight = 40;
    const spacing = 20;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建血条背景（灰色边框）
      const bgBar = this.add.graphics();
      bgBar.lineStyle(3, 0x666666, 1);
      bgBar.strokeRect(x, startY, barWidth, barHeight);
      
      // 创建血条填充（红色）
      const fillBar = this.add.graphics();
      fillBar.fillStyle(0xff0000, 1);
      fillBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      
      this.healthBars.push({
        background: bgBar,
        fill: fillBar,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }
  }

  updateHealthBars() {
    // 更新每个血条的显示状态
    for (let i = 0; i < this.healthBars.length; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();
      
      if (i < this.currentHealth) {
        // 有生命值，显示红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      } else {
        // 无生命值，显示暗灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      }
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
    this.updateDebugInfo();
  }

  takeDamage() {
    if (!this.canTakeDamage) return;
    
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBars();
      this.showStatus('Took Damage! -1 HP', 0xff0000);
      
      // 添加伤害延迟，防止连续扣血
      this.canTakeDamage = false;
      this.time.delayedCall(this.damageDelay, () => {
        this.canTakeDamage = true;
      });

      // 血条抖动效果
      this.cameras.main.shake(100, 0.005);
    } else {
      this.showStatus('No Health Left!', 0xff6666);
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBars();
      this.showStatus('Auto Heal! +1 HP', 0x00ff00);
      
      // 治疗闪光效果
      this.cameras.main.flash(200, 0, 255, 0, false, null, this);
    }
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 状态文本淡出效果
    this.tweens.add({
      targets: this.statusText,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      onComplete: () => {
        this.statusText.setText('');
        this.statusText.setAlpha(1);
      }
    });
  }

  updateDebugInfo() {
    const timerProgress = this.healTimer.getProgress();
    const timeUntilHeal = ((1 - timerProgress) * 1000).toFixed(0);
    this.debugText.setText(
      `Debug Info:\n` +
      `Health: ${this.currentHealth}/${this.maxHealth}\n` +
      `Next Heal in: ${timeUntilHeal}ms\n` +
      `Can Take Damage: ${this.canTakeDamage}`
    );
  }

  update(time, delta) {
    // 检测方向键按下
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.takeDamage();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.takeDamage();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.takeDamage();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.takeDamage();
    }

    // 更新调试信息
    this.updateDebugInfo();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);