class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press WASD to take damage | Auto heal every 3 seconds', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 显示当前生命值文本
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 显示定时器信息
    this.timerText = this.add.text(400, 500, 'Next heal in: 3.0s', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 消息提示文本
    this.messageText = this.add.text(400, 550, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 60;
    const blockHeight = 40;
    const spacing = 10;
    const startX = 400 - (this.maxHealth * (blockWidth + spacing) - spacing) / 2;
    const startY = 250;

    // 创建8个血格
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + spacing);
      const y = startY;

      // 创建血格背景（深灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血格填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 3, y + 3, blockWidth - 6, blockHeight - 6);

      this.healthBlocks.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  updateHealthBar() {
    // 更新每个血格的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.fill.clear();

      if (i < this.currentHealth) {
        // 有血：红色
        block.fill.fillStyle(0xff0000, 1);
        block.active = true;
      } else {
        // 无血：深灰色
        block.fill.fillStyle(0x222222, 1);
        block.active = false;
      }

      const blockWidth = 60;
      const blockHeight = 40;
      const spacing = 10;
      const startX = 400 - (this.maxHealth * (blockWidth + spacing) - spacing) / 2;
      const startY = 250;
      const x = startX + i * (blockWidth + spacing);
      const y = startY;

      block.fill.fillRect(x + 3, y + 3, blockWidth - 6, blockHeight - 6);
    }

    // 更新生命值文本
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
  }

  setupInput() {
    // 创建WASD键
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.keys.W.on('down', () => this.takeDamage('W'));
    this.keys.A.on('down', () => this.takeDamage('A'));
    this.keys.S.on('down', () => this.takeDamage('S'));
    this.keys.D.on('down', () => this.takeDamage('D'));
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.showMessage(`Pressed ${key} - Took 1 damage!`, 0xff0000);

      if (this.currentHealth === 0) {
        this.showMessage('Health depleted!', 0xff0000);
      }
    } else {
      this.showMessage('Already at 0 health!', 0xff6600);
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.showMessage('+1 Health restored!', 0x00ff00);
    } else {
      this.showMessage('Already at full health!', 0x00ffff);
    }
  }

  showMessage(text, color) {
    this.messageText.setText(text);
    this.messageText.setColor('#' + color.toString(16).padStart(6, '0'));

    // 清除之前的淡出动画
    this.tweens.killTweensOf(this.messageText);

    // 重置透明度
    this.messageText.setAlpha(1);

    // 2秒后淡出消息
    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      duration: 1000,
      delay: 1000
    });
  }

  update(time, delta) {
    // 更新定时器显示
    const remaining = this.healTimer.getRemaining();
    const seconds = (remaining / 1000).toFixed(1);
    this.timerText.setText(`Next heal in: ${seconds}s`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    healTimerDelay: scene.healTimer.delay,
    healTimerRemaining: scene.healTimer.getRemaining()
  };
};