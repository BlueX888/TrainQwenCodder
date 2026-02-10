// 完整的 Phaser3 血条回血系统
class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 5;
    this.currentHealth = 5;
    this.healthBars = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化可验证信号
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      damageCount: 0,
      healCount: 0,
      timestamp: Date.now()
    };

    // 创建标题文本
    this.add.text(400, 100, '血条系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, '按 W/A/S/D 键扣血，每秒自动回复1点', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(400, 350, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建详细信息文本
    this.infoText = this.add.text(400, 400, '', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.setupInput();

    // 设置自动回血定时器
    this.healTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 更新显示
    this.updateDisplay();

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      timestamp: Date.now()
    }));
  }

  createHealthBar() {
    const startX = 250;
    const startY = 250;
    const barWidth = 50;
    const barHeight = 60;
    const spacing = 10;

    // 创建5个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + spacing);
      
      // 创建背景（空血条）
      const background = this.add.graphics();
      background.fillStyle(0x333333, 1);
      background.fillRect(x, startY, barWidth, barHeight);
      background.lineStyle(2, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建前景（满血条）
      const foreground = this.add.graphics();
      foreground.fillStyle(0xff0000, 1);
      foreground.fillRect(x + 2, startY + 2, barWidth - 4, barHeight - 4);

      this.healthBars.push({
        background,
        foreground,
        x,
        y: startY
      });
    }
  }

  setupInput() {
    // 创建 WASD 键
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 监听按键按下事件
    this.keys.W.on('down', () => this.takeDamage('W'));
    this.keys.A.on('down', () => this.takeDamage('A'));
    this.keys.S.on('down', () => this.takeDamage('S'));
    this.keys.D.on('down', () => this.takeDamage('D'));
  }

  takeDamage(key) {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;
      window.__signals__.timestamp = Date.now();

      this.updateHealthBar();
      this.statusText.setText(`按下 ${key} 键！受到伤害 -1`);
      this.statusText.setColor('#ff0000');

      // 输出日志
      console.log(JSON.stringify({
        event: 'damage',
        key: key,
        health: this.currentHealth,
        damageCount: window.__signals__.damageCount,
        timestamp: Date.now()
      }));

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.statusText.setText('生命值耗尽！');
        console.log(JSON.stringify({
          event: 'death',
          timestamp: Date.now()
        }));
      }
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth++;
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      window.__signals__.timestamp = Date.now();

      this.updateHealthBar();
      this.statusText.setText('自动回复 +1');
      this.statusText.setColor('#00ff00');

      // 输出日志
      console.log(JSON.stringify({
        event: 'heal',
        health: this.currentHealth,
        healCount: window.__signals__.healCount,
        timestamp: Date.now()
      }));
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.foreground.clear();

      if (i < this.currentHealth) {
        // 显示满血格子
        bar.foreground.fillStyle(0xff0000, 1);
        bar.foreground.fillRect(bar.x + 2, bar.y + 2, 46, 56);
      }
    }

    this.updateDisplay();
  }

  updateDisplay() {
    // 更新信息文本
    this.infoText.setText(
      `当前生命值: ${this.currentHealth}/${this.maxHealth} | ` +
      `受伤次数: ${window.__signals__.damageCount} | ` +
      `回血次数: ${window.__signals__.healCount}`
    );
  }

  update(time, delta) {
    // 每帧更新（如果需要额外逻辑）
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