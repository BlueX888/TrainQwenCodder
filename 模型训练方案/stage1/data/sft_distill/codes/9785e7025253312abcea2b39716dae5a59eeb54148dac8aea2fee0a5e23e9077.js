class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarWidth = 400;
    this.healthBarHeight = 40;
    this.cellWidth = this.healthBarWidth / this.maxHealth;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建血条容器位置
    this.healthBarX = 200;
    this.healthBarY = 100;

    // 创建血条Graphics对象
    this.healthBarGraphics = this.add.graphics();

    // 创建健康值文本显示
    this.healthText = this.add.text(400, 200, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 300, 'Press W/A/S/D to take damage', {
      fontSize: '24px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 340, 'Auto heal 1 HP every 1.5 seconds', {
      fontSize: '24px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 为每个按键添加单次触发事件
    this.keys.w.on('down', () => this.takeDamage());
    this.keys.a.on('down', () => this.takeDamage());
    this.keys.s.on('down', () => this.takeDamage());
    this.keys.d.on('down', () => this.takeDamage());

    // 创建自动回血定时器 (1.5秒 = 1500毫秒)
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.heal,
      callbackScope: this,
      loop: true
    });

    // 初始化血条显示
    this.updateHealthBar();
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      
      // 添加视觉反馈 - 屏幕闪红
      this.cameras.main.flash(100, 255, 0, 0, false);
    }
  }

  heal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      
      // 添加视觉反馈 - 轻微绿色闪烁
      this.cameras.main.flash(100, 0, 255, 0, false, 0.3);
    }
  }

  updateHealthBar() {
    // 清除之前的绘制
    this.healthBarGraphics.clear();

    // 绘制血条外框
    this.healthBarGraphics.lineStyle(3, 0x000000, 1);
    this.healthBarGraphics.strokeRect(
      this.healthBarX - 2,
      this.healthBarY - 2,
      this.healthBarWidth + 4,
      this.healthBarHeight + 4
    );

    // 绘制红色背景（损失的血量）
    this.healthBarGraphics.fillStyle(0xcc0000, 1);
    this.healthBarGraphics.fillRect(
      this.healthBarX,
      this.healthBarY,
      this.healthBarWidth,
      this.healthBarHeight
    );

    // 绘制绿色前景（当前血量）
    const currentWidth = (this.currentHealth / this.maxHealth) * this.healthBarWidth;
    this.healthBarGraphics.fillStyle(0x00ff00, 1);
    this.healthBarGraphics.fillRect(
      this.healthBarX,
      this.healthBarY,
      currentWidth,
      this.healthBarHeight
    );

    // 绘制分格线
    this.healthBarGraphics.lineStyle(1, 0x000000, 0.5);
    for (let i = 1; i < this.maxHealth; i++) {
      const x = this.healthBarX + i * this.cellWidth;
      this.healthBarGraphics.lineBetween(
        x,
        this.healthBarY,
        x,
        this.healthBarY + this.healthBarHeight
      );
    }

    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth} / ${this.maxHealth}`);
    
    // 根据血量改变文本颜色
    if (this.currentHealth <= 5) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth <= 10) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#00ff00');
    }
  }

  update(time, delta) {
    // 血条更新已在事件中处理，这里可以添加其他逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);