class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthGraphics = null;
    this.healthText = null;
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化生命值
    this.currentHealth = this.maxHealth;

    // 创建标题文本
    this.add.text(400, 100, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '按 W/A/S/D 键扣血 | 每1.5秒自动回复1点', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.healthGraphics = this.add.graphics();
    this.drawHealthBar();

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 350, `当前生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupKeyboardInput();

    // 创建自动回血定时器（每1.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.add.text(10, 10, '状态验证: health变量可通过控制台访问', {
      fontSize: '14px',
      color: '#888888'
    });
  }

  setupKeyboardInput() {
    // 创建WASD键
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    keyW.on('down', () => this.takeDamage());
    keyA.on('down', () => this.takeDamage());
    keyS.on('down', () => this.takeDamage());
    keyD.on('down', () => this.takeDamage());
  }

  drawHealthBar() {
    // 清除之前的绘制
    this.healthGraphics.clear();

    const barWidth = 80;
    const barHeight = 40;
    const spacing = 20;
    const startX = 400 - (barWidth * 1.5 + spacing);
    const startY = 250;

    // 绘制3个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 绘制边框
      this.healthGraphics.lineStyle(3, 0xffffff, 1);
      this.healthGraphics.strokeRect(x, startY, barWidth, barHeight);

      // 根据当前生命值决定填充颜色
      if (i < this.currentHealth) {
        // 有血 - 红色填充
        this.healthGraphics.fillStyle(0xff0000, 1);
        this.healthGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      } else {
        // 无血 - 深灰色填充
        this.healthGraphics.fillStyle(0x333333, 1);
        this.healthGraphics.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);
      }
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthDisplay();
      
      // 添加视觉反馈 - 屏幕闪烁
      this.cameras.main.shake(100, 0.005);
      
      console.log(`受到伤害! 当前生命值: ${this.currentHealth}/${this.maxHealth}`);
      
      if (this.currentHealth === 0) {
        this.showGameOverMessage();
      }
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth && this.currentHealth > 0) {
      this.currentHealth++;
      this.updateHealthDisplay();
      
      // 添加视觉反馈 - 绿色闪光
      this.cameras.main.flash(200, 0, 255, 0, false);
      
      console.log(`回复生命! 当前生命值: ${this.currentHealth}/${this.maxHealth}`);
    }
  }

  updateHealthDisplay() {
    // 重新绘制血条
    this.drawHealthBar();
    
    // 更新文本显示
    this.healthText.setText(`当前生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值改变文本颜色
    if (this.currentHealth === 0) {
      this.healthText.setColor('#ff0000');
    } else if (this.currentHealth === 1) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#ffffff');
    }
  }

  showGameOverMessage() {
    // 显示游戏结束提示
    const gameOverText = this.add.text(400, 450, '生命值耗尽! 等待自动回血...', {
      fontSize: '28px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 2秒后淡出提示
    this.tweens.add({
      targets: gameOverText,
      alpha: 0,
      duration: 2000,
      delay: 2000,
      onComplete: () => gameOverText.destroy()
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
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

// 导出健康值用于验证（可在控制台访问）
window.getHealth = () => {
  const scene = game.scene.scenes[0];
  return {
    current: scene.currentHealth,
    max: scene.maxHealth
  };
};