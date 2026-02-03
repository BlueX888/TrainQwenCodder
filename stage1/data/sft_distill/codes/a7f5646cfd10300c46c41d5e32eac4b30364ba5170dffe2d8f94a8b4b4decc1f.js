class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
    this.lastKeyPressTime = 0;
    this.keyPressDelay = 200; // 防止按键过快
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
    this.add.text(400, 100, '按 W/A/S/D 键扣血，每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 250, `生命值: ${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 创建自动回血定时器（每3秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加定时器信息显示
    this.timerText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 添加最后一次操作提示
    this.actionText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 50;
    const blockHeight = 30;
    const blockGap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + blockGap) - blockGap) / 2;
    const startY = 150;

    // 创建8个血块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockGap);
      
      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, startY, blockWidth, blockHeight);

      // 创建血量方块（红色填充）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff0000, 1);
      healthBlock.fillRect(x + 2, startY + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: background,
        block: healthBlock,
        x: x,
        y: startY,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  setupInput() {
    // 创建WASD按键
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.input.keyboard.on('keydown-W', () => this.takeDamage('W'));
    this.input.keyboard.on('keydown-A', () => this.takeDamage('A'));
    this.input.keyboard.on('keydown-S', () => this.takeDamage('S'));
    this.input.keyboard.on('keydown-D', () => this.takeDamage('D'));
  }

  takeDamage(key) {
    const currentTime = this.time.now;
    
    // 防止按键过快
    if (currentTime - this.lastKeyPressTime < this.keyPressDelay) {
      return;
    }
    
    this.lastKeyPressTime = currentTime;

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.actionText.setText(`按下 ${key} 键 - 受到伤害！`);
      this.actionText.setColor('#ff0000');

      // 重置回血定时器
      this.healTimer.reset({
        delay: 3000,
        callback: this.healHealth,
        callbackScope: this,
        loop: true
      });

      if (this.currentHealth === 0) {
        this.actionText.setText('生命值耗尽！');
      }
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.actionText.setText('自动回复 +1 生命值');
      this.actionText.setColor('#00ff00');
    }
  }

  updateHealthBar() {
    // 更新每个血块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const healthBlock = this.healthBlocks[i];
      healthBlock.block.clear();

      if (i < this.currentHealth) {
        // 有血量：显示红色
        healthBlock.block.fillStyle(0xff0000, 1);
        healthBlock.block.fillRect(
          healthBlock.x + 2,
          healthBlock.y + 2,
          healthBlock.width - 4,
          healthBlock.height - 4
        );
      } else {
        // 无血量：显示深灰色
        healthBlock.block.fillStyle(0x333333, 1);
        healthBlock.block.fillRect(
          healthBlock.x + 2,
          healthBlock.y + 2,
          healthBlock.width - 4,
          healthBlock.height - 4
        );
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  update(time, delta) {
    // 显示下次回血倒计时
    const nextHealTime = this.healTimer.getRemaining();
    this.timerText.setText(`下次自动回血: ${(nextHealTime / 1000).toFixed(1)} 秒`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene
};

new Phaser.Game(config);