// 完整的 Phaser3 血条+回血系统
class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.hearts = [];
    
    // 初始化信号系统用于验证
    window.__signals__ = {
      health: this.currentHealth,
      healthChanges: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 50, '血条系统演示', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建操作说明
    this.add.text(400, 100, '按空格键扣血 | 每1.5秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建生命值文本显示
    this.healthText = this.add.text(400, 450, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建事件日志文本
    this.logText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血计时器（每1.5秒触发一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志清除计时器
    this.logClearTimer = null;
  }

  // 创建血条显示
  createHealthBar() {
    const startX = 250;
    const startY = 200;
    const heartSize = 60;
    const spacing = 80;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * spacing;
      const heart = this.add.graphics();
      heart.x = x;
      heart.y = startY;
      
      this.hearts.push(heart);
      this.drawHeart(heart, true); // 初始为满血
    }
  }

  // 绘制心形
  drawHeart(graphics, filled) {
    graphics.clear();
    
    const color = filled ? 0xff0000 : 0x444444;
    const alpha = filled ? 1 : 0.5;
    
    graphics.fillStyle(color, alpha);
    graphics.lineStyle(3, 0xffffff, 1);

    // 使用路径绘制心形
    const path = new Phaser.Curves.Path();
    
    // 心形的数学曲线
    path.moveTo(0, -10);
    path.cubicBezierTo(-30, -30, -30, -10, -30, 0);
    path.cubicBezierTo(-30, 15, -15, 25, 0, 35);
    path.cubicBezierTo(15, 25, 30, 15, 30, 0);
    path.cubicBezierTo(30, -10, 30, -30, 0, -10);

    // 填充心形
    graphics.fillPoints(path.getPoints(50), true);
    graphics.strokePoints(path.getPoints(50), true);
  }

  // 更新血条显示
  updateHealthBar() {
    for (let i = 0; i < this.maxHealth; i++) {
      const filled = i < this.currentHealth;
      this.drawHeart(this.hearts[i], filled);
    }
    
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新验证信号
    window.__signals__.health = this.currentHealth;
  }

  // 受到伤害
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.showLog(`-${amount} 生命值`, '#ff4444');
      
      // 记录伤害事件
      window.__signals__.healthChanges.push({
        type: 'damage',
        amount: amount,
        health: this.currentHealth,
        timestamp: Date.now()
      });

      console.log(JSON.stringify({
        event: 'damage',
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));

      if (this.currentHealth === 0) {
        this.showLog('生命值耗尽！', '#ff0000');
      }
    }
  }

  // 自动回血
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      this.updateHealthBar();
      this.showLog('+1 生命值 (自动回复)', '#44ff44');
      
      // 记录回血事件
      window.__signals__.healthChanges.push({
        type: 'heal',
        amount: 1,
        health: this.currentHealth,
        timestamp: Date.now()
      });

      console.log(JSON.stringify({
        event: 'heal',
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));
    }
  }

  // 显示日志信息
  showLog(message, color) {
    this.logText.setText(message);
    this.logText.setColor(color);

    // 清除之前的计时器
    if (this.logClearTimer) {
      this.logClearTimer.remove();
    }

    // 2秒后清除日志
    this.logClearTimer = this.time.delayedCall(2000, () => {
      this.logText.setText('');
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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

// 输出初始状态用于验证
console.log(JSON.stringify({
  event: 'init',
  health: 3,
  maxHealth: 3,
  healInterval: 1500
}));