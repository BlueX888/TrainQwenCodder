class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
    this.lastDamageTime = 0;
    this.damageDelay = 200; // 防止按键连续扣血
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 100, '按方向键扣血 | 每4秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示（用于验证）
    this.healthText = this.add.text(400, 450, `当前生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建操作提示
    this.add.text(400, 500, '↑ ↓ ← → 按任意方向键扣血', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置自动回血计时器（每4秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建计时器显示
    this.timerText = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 50;
    const blockHeight = 50;
    const gap = 10;
    const startX = 400 - (this.maxHealth * (blockWidth + gap) - gap) / 2;
    const startY = 250;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      const y = startY;

      // 创建血条方块
      const block = this.add.graphics();
      block.x = x;
      block.y = y;
      
      this.healthBlocks.push(block);
      this.drawHealthBlock(block, true);
    }
  }

  drawHealthBlock(block, isFilled) {
    block.clear();
    
    if (isFilled) {
      // 红色表示有生命值
      block.fillStyle(0xff0000, 1);
      block.fillRect(0, 0, 50, 50);
      
      // 添加高光效果
      block.fillStyle(0xff6666, 1);
      block.fillRect(5, 5, 40, 20);
    } else {
      // 灰色表示已损失
      block.fillStyle(0x333333, 1);
      block.fillRect(0, 0, 50, 50);
    }
    
    // 绘制边框
    block.lineStyle(2, 0x000000, 1);
    block.strokeRect(0, 0, 50, 50);
  }

  takeDamage() {
    const currentTime = this.time.now;
    
    // 防止连续扣血
    if (currentTime - this.lastDamageTime < this.damageDelay) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.lastDamageTime = currentTime;
      this.updateHealthBar();
      
      // 创建扣血特效
      this.cameras.main.shake(100, 0.005);
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      
      // 创建回血特效
      this.cameras.main.flash(200, 0, 255, 0, false);
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const isFilled = i < this.currentHealth;
      this.drawHealthBlock(this.healthBlocks[i], isFilled);
    }

    // 更新文本显示
    this.healthText.setText(`当前生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth <= 2) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 4) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  update(time, delta) {
    // 检测方向键输入
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.takeDamage();
    }

    // 更新计时器显示
    const elapsed = this.healTimer.elapsed;
    const remaining = 4000 - elapsed;
    const seconds = Math.ceil(remaining / 1000);
    this.timerText.setText(`下次回血倒计时: ${seconds}秒`);
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