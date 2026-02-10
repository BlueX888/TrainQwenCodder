class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBlocks = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, '按 W/A/S/D 键扣血，每1.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入监听
    this.setupInput();

    // 设置自动回血定时器
    this.setupHealthRegeneration();

    // 创建操作提示
    this.createInstructions();
  }

  createHealthBar() {
    const blockWidth = 30;
    const blockHeight = 40;
    const gap = 5;
    const startX = 400 - (this.maxHealth * (blockWidth + gap)) / 2;
    const startY = 250;

    // 创建20个血条方块
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + gap);
      
      // 创建背景方块（深灰色）
      const bgBlock = this.add.graphics();
      bgBlock.fillStyle(0x333333, 1);
      bgBlock.fillRect(x, startY, blockWidth, blockHeight);
      bgBlock.lineStyle(2, 0x666666, 1);
      bgBlock.strokeRect(x, startY, blockWidth, blockHeight);

      // 创建生命值方块（绿色）
      const healthBlock = this.add.graphics();
      healthBlock.fillStyle(0x00ff00, 1);
      healthBlock.fillRect(x + 2, startY + 2, blockWidth - 4, blockHeight - 4);
      healthBlock.visible = true;

      this.healthBlocks.push({
        bg: bgBlock,
        health: healthBlock,
        x: x,
        y: startY
      });
    }
  }

  setupInput() {
    // 创建WASD键
    this.keys = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.keys.w.on('down', () => this.takeDamage());
    this.keys.a.on('down', () => this.takeDamage());
    this.keys.s.on('down', () => this.takeDamage());
    this.keys.d.on('down', () => this.takeDamage());
  }

  setupHealthRegeneration() {
    // 每1.5秒回复1点生命值
    this.time.addEvent({
      delay: 1500,
      callback: this.regenerateHealth,
      callbackScope: this,
      loop: true
    });
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.flashHealthBar(0xff0000); // 红色闪烁表示受伤
    }
  }

  regenerateHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.flashHealthBar(0x00ffff); // 青色闪烁表示回血
    }
  }

  updateHealthBar() {
    // 更新文本显示
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 根据生命值百分比改变文本颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    if (healthPercent > 0.5) {
      this.healthText.setColor('#00ff00');
    } else if (healthPercent > 0.25) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }

    // 更新血条方块显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.currentHealth) {
        this.healthBlocks[i].health.visible = true;
      } else {
        this.healthBlocks[i].health.visible = false;
      }
    }
  }

  flashHealthBar(color) {
    // 创建闪烁效果
    const flash = this.add.graphics();
    flash.fillStyle(color, 0.3);
    flash.fillRect(0, 200, 800, 150);

    // 0.2秒后移除闪烁效果
    this.time.delayedCall(200, () => {
      flash.destroy();
    });
  }

  createInstructions() {
    const instructions = [
      '操作说明:',
      'W/A/S/D - 扣除1点生命值',
      '自动回血 - 每1.5秒回复1点'
    ];

    let yOffset = 400;
    instructions.forEach(text => {
      this.add.text(400, yOffset, text, {
        fontSize: '16px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      yOffset += 25;
    });

    // 添加状态指示器（用于验证）
    this.statusText = this.add.text(400, 550, '状态: 正常', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新状态指示器
    if (this.currentHealth === 0) {
      this.statusText.setText('状态: 生命值耗尽！');
      this.statusText.setColor('#ff0000');
    } else if (this.currentHealth === this.maxHealth) {
      this.statusText.setText('状态: 满血状态');
      this.statusText.setColor('#00ff00');
    } else {
      this.statusText.setText(`状态: 生命值 ${this.currentHealth}/${this.maxHealth}`);
      this.statusText.setColor('#ffff00');
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