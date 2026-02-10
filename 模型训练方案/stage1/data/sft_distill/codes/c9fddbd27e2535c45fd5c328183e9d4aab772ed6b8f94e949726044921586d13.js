class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 3;
    this.currentHealth = 3;
    this.healthBars = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      logs: []
    };

    // 创建标题文本
    this.add.text(400, 100, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 150, 'Press SPACE to take damage', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.add.text(400, 180, 'Auto heal 1 HP every 1.5 seconds', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 250, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建血条容器
    const startX = 300;
    const startY = 300;
    const barWidth = 60;
    const barHeight = 80;
    const gap = 10;

    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (barWidth + gap);
      
      // 创建血条背景（边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x666666, 1);
      background.strokeRect(x, startY, barWidth, barHeight);

      // 创建血条填充
      const fill = this.add.graphics();
      fill.fillStyle(0xff0000, 1);
      fill.fillRect(x + 3, startY + 3, barWidth - 6, barHeight - 6);

      this.healthBars.push({
        background: background,
        fill: fill,
        x: x,
        y: startY,
        width: barWidth,
        height: barHeight
      });
    }

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.takeDamage(1);
    });

    // 创建自动回血定时器（每1.5秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 1500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 创建日志显示文本
    this.logText = this.add.text(400, 450, '', {
      fontSize: '16px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.addLog('Game started - Full health');
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.addLog(`Took ${amount} damage! Health: ${this.currentHealth}/${this.maxHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      console.log(JSON.stringify({
        event: 'damage',
        health: this.currentHealth,
        amount: amount,
        timestamp: Date.now()
      }));
    }
  }

  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.addLog(`Auto healed! Health: ${this.currentHealth}/${this.maxHealth}`);
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      console.log(JSON.stringify({
        event: 'heal',
        health: this.currentHealth,
        amount: 1,
        timestamp: Date.now()
      }));
    }
  }

  updateHealthBar() {
    // 更新文本显示
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const bar = this.healthBars[i];
      bar.fill.clear();
      
      if (i < this.currentHealth) {
        // 显示红色填充
        bar.fill.fillStyle(0xff0000, 1);
        bar.fill.fillRect(
          bar.x + 3,
          bar.y + 3,
          bar.width - 6,
          bar.height - 6
        );
      } else {
        // 显示灰色（空血条）
        bar.fill.fillStyle(0x333333, 1);
        bar.fill.fillRect(
          bar.x + 3,
          bar.y + 3,
          bar.width - 6,
          bar.height - 6
        );
      }
    }
  }

  addLog(message) {
    const log = {
      message: message,
      timestamp: Date.now()
    };
    window.__signals__.logs.push(log);
    
    // 只显示最新的日志
    this.logText.setText(message);
    
    // 保持日志数组不超过10条
    if (window.__signals__.logs.length > 10) {
      window.__signals__.logs.shift();
    }
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
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