class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
    this.lastDamageTime = 0;
    this.damageCooldown = 200; // 防止连续扣血
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 130, 'Auto Heal: +1 HP every 4 seconds', {
      fontSize: '16px',
      color: '#88ff88'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示（用于验证）
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置自动回血定时器（每 4 秒）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 显示初始状态
    this.updateHealthBar();
  }

  createHealthBar() {
    const startX = 240;
    const startY = 250;
    const blockWidth = 40;
    const blockHeight = 50;
    const gap = 10;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血块（红色填充）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0xff0000, 1);
      healthBlock.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: background,
        block: healthBlock,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  updateHealthBar() {
    // 更新每个血块的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const healthBlock = this.healthBlocks[i];
      healthBlock.block.clear();

      if (i < this.currentHealth) {
        // 有生命值：显示红色
        healthBlock.block.fillStyle(0xff0000, 1);
        healthBlock.block.fillRect(
          healthBlock.x + 2,
          healthBlock.y + 2,
          healthBlock.width - 4,
          healthBlock.height - 4
        );
      } else {
        // 无生命值：显示深灰色
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
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage() {
    const currentTime = this.time.now;
    
    // 防止连续扣血
    if (currentTime - this.lastDamageTime < this.damageCooldown) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.lastDamageTime = currentTime;
      this.updateHealthBar();
      this.showStatus('Took Damage! -1 HP', 0xff4444);

      if (this.currentHealth === 0) {
        this.showStatus('Health Depleted!', 0xff0000);
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.showStatus('Auto Heal! +1 HP', 0x44ff44);
    }
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));

    // 2 秒后清除状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
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