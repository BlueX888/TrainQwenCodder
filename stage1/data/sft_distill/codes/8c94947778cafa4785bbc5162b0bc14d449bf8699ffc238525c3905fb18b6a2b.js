class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.health = 8;
    this.healthBars = [];
    this.healTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化生命值
    this.health = this.maxHealth;

    // 创建标题文本
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 100, '按 W/A/S/D 键扣血，每3秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupKeyboard();

    // 设置自动回血定时器（每3秒回复1点）
    this.healTimer = this.time.addEvent({
      delay: 3000,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 添加状态提示文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const startX = 200;
    const startY = 200;
    const barWidth = 50;
    const barHeight = 80;
    const gap = 10;

    // 创建8个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      // 创建背景框（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充（红色）
      const healthBar = this.add.graphics();
      healthBar.fillStyle(0xff0000, 1);
      healthBar.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({
        background: background,
        fill: healthBar,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }

    this.updateHealthBar();
  }

  updateHealthBar() {
    // 更新每个血条格子的显示状态
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();

      if (i < this.health) {
        // 有血：显示红色
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      } else {
        // 无血：显示深灰色
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(bar.x + 3, bar.y + 3, bar.width - 6, bar.height - 6);
      }
    }

    // 更新文本显示
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
  }

  setupKeyboard() {
    // 监听 W/A/S/D 键
    const keys = ['W', 'A', 'S', 'D'];
    
    keys.forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.takeDamage();
      });
    });
  }

  takeDamage() {
    if (this.health > 0) {
      this.health--;
      this.updateHealthBar();
      this.showStatus('受到伤害！-1 HP', 0xff0000);
      
      if (this.health === 0) {
        this.showStatus('生命值耗尽！', 0xff0000);
      }
    }
  }

  healHealth() {
    if (this.health < this.maxHealth) {
      this.health++;
      this.updateHealthBar();
      this.showStatus('自动回复！+1 HP', 0x00ff00);
    }
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 1秒后清空状态文本
    this.time.delayedCall(1000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 可在此处添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);