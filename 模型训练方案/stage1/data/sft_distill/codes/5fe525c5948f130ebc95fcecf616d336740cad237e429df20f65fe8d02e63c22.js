class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarWidth = 600;
    this.healthBarHeight = 40;
    this.healthBarX = 100;
    this.healthBarY = 100;
    this.cellWidth = this.healthBarWidth / this.maxHealth;
    this.cellGap = 2;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统 - 点击鼠标扣血', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建Graphics对象用于绘制血条
    this.healthBarGraphics = this.add.graphics();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 170, '', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 220, '左键点击扣血 | 每2秒自动回复1点', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 初始绘制血条
    this.drawHealthBar();

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.takeDamage(1);
      }
    });

    // 创建2秒循环定时器用于自动回血
    this.healTimer = this.time.addEvent({
      delay: 2000,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 创建状态日志文本
    this.logText = this.add.text(400, 280, '', {
      fontSize: '14px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  /**
   * 绘制血条
   */
  drawHealthBar() {
    // 清空之前的绘制
    this.healthBarGraphics.clear();

    // 绘制背景边框
    this.healthBarGraphics.lineStyle(2, 0x666666, 1);
    this.healthBarGraphics.strokeRect(
      this.healthBarX - 2,
      this.healthBarY - 2,
      this.healthBarWidth + 4,
      this.healthBarHeight + 4
    );

    // 绘制每一格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const cellX = this.healthBarX + i * this.cellWidth;
      const actualCellWidth = this.cellWidth - this.cellGap;

      if (i < this.currentHealth) {
        // 当前生命值 - 红色
        this.healthBarGraphics.fillStyle(0xff0000, 1);
      } else {
        // 已损失生命值 - 深灰色
        this.healthBarGraphics.fillStyle(0x333333, 1);
      }

      this.healthBarGraphics.fillRect(
        cellX,
        this.healthBarY,
        actualCellWidth,
        this.healthBarHeight
      );
    }

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth} / ${this.maxHealth}`);
  }

  /**
   * 受到伤害
   * @param {number} amount 伤害值
   */
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.drawHealthBar();
      this.logText.setText(`受到伤害 -${amount} | 当前: ${this.currentHealth}`);
      
      if (this.currentHealth === 0) {
        this.logText.setText('生命值已耗尽！');
      }
    }
  }

  /**
   * 治疗回血
   */
  heal() {
    if (this.currentHealth < this.maxHealth) {
      const healAmount = 1;
      const oldHealth = this.currentHealth;
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healAmount);
      this.drawHealthBar();
      this.logText.setText(`自动回复 +${healAmount} | 当前: ${this.currentHealth}`);
    } else {
      this.logText.setText(`生命值已满 | 当前: ${this.currentHealth}`);
    }
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中，血条更新在事件触发时进行
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出可验证的状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, HealthBarScene };
}