class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBlocks = [];
    this.lastDamageTime = 0;
    this.damageDelay = 200; // 防止按键连续触发，200ms防抖
  }

  preload() {
    // 不需要加载外部资源
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
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态文本（用于显示扣血/回血提示）
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建4秒回血定时器
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
  }

  createHealthBar() {
    const blockWidth = 50;
    const blockHeight = 30;
    const blockSpacing = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + blockSpacing)) / 2;
    const startY = 250;

    // 创建10个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建血量填充（红色）
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 2, y + 2, blockWidth - 4, blockHeight - 4);

      this.healthBlocks.push({
        background: background,
        fill: fill,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight
      });
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      block.fill.clear();

      if (i < this.currentHealth) {
        // 有生命值的格子显示红色
        block.fill.fillStyle(0xff0000, 1);
        block.fill.fillRect(
          block.x + 2,
          block.y + 2,
          block.width - 4,
          block.height - 4
        );
      } else {
        // 没有生命值的格子显示深灰色
        block.fill.fillStyle(0x333333, 1);
        block.fill.fillRect(
          block.x + 2,
          block.y + 2,
          block.width - 4,
          block.height - 4
        );
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
  }

  takeDamage() {
    const currentTime = this.time.now;
    
    // 防抖处理，避免按键连续触发
    if (currentTime - this.lastDamageTime < this.damageDelay) {
      return;
    }

    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.lastDamageTime = currentTime;
      this.updateHealthBar();
      
      // 显示扣血提示
      this.statusText.setText('受到伤害 -1');
      this.statusText.setColor('#ff0000');
      
      // 1秒后清除提示
      this.time.delayedCall(1000, () => {
        this.statusText.setText('');
      });

      // 添加血条震动效果
      this.cameras.main.shake(100, 0.005);

      if (this.currentHealth === 0) {
        this.statusText.setText('生命值耗尽！');
        this.statusText.setColor('#ff0000');
      }
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      
      // 显示回血提示
      this.statusText.setText('自动回复 +1');
      this.statusText.setColor('#00ff00');
      
      // 1秒后清除提示
      this.time.delayedCall(1000, () => {
        this.statusText.setText('');
      });

      // 添加回血闪烁效果
      this.healthBlocks[this.currentHealth - 1].fill.setAlpha(0.5);
      this.tweens.add({
        targets: this.healthBlocks[this.currentHealth - 1].fill,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    }
  }

  update(time, delta) {
    // 检测方向键输入
    if (this.cursors.left.isDown || 
        this.cursors.right.isDown || 
        this.cursors.up.isDown || 
        this.cursors.down.isDown) {
      this.takeDamage();
    }

    // 更新调试信息
    const timeUntilHeal = 4000 - (this.healTimer.elapsed % 4000);
    this.debugText.setText(
      `Health: ${this.currentHealth}/${this.maxHealth}\n` +
      `Next heal in: ${(timeUntilHeal / 1000).toFixed(1)}s\n` +
      `Timer elapsed: ${(this.healTimer.elapsed / 1000).toFixed(1)}s`
    );
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