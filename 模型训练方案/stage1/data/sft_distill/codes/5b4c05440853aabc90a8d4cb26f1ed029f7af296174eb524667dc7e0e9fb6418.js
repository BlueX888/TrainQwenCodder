class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 20;
    this.currentHealth = 20;
    this.healthBarGraphics = null;
    this.cursors = null;
    this.healTimer = null;
    this.keyPressedLastFrame = {
      left: false,
      right: false,
      up: false,
      down: false
    };
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
      logs: []
    };

    // 创建血条背景和前景
    this.healthBarGraphics = this.add.graphics();
    this.drawHealthBar();

    // 添加文字说明
    this.add.text(50, 100, 'Press Arrow Keys to Take Damage', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.add.text(50, 130, 'Auto Heal: +1 HP every 0.5s', {
      fontSize: '18px',
      color: '#00ff00'
    });

    this.healthText = this.add.text(50, 160, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器，每0.5秒触发一次
    this.healTimer = this.time.addEvent({
      delay: 500, // 0.5秒
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 记录初始状态
    this.logEvent('Game Started', this.currentHealth);
  }

  update(time, delta) {
    // 检测方向键按下（边缘检测，避免连续扣血）
    const leftPressed = this.cursors.left.isDown && !this.keyPressedLastFrame.left;
    const rightPressed = this.cursors.right.isDown && !this.keyPressedLastFrame.right;
    const upPressed = this.cursors.up.isDown && !this.keyPressedLastFrame.up;
    const downPressed = this.cursors.down.isDown && !this.keyPressedLastFrame.down;

    // 更新上一帧按键状态
    this.keyPressedLastFrame.left = this.cursors.left.isDown;
    this.keyPressedLastFrame.right = this.cursors.right.isDown;
    this.keyPressedLastFrame.up = this.cursors.up.isDown;
    this.keyPressedLastFrame.down = this.cursors.down.isDown;

    // 任意方向键按下时扣血
    if (leftPressed || rightPressed || upPressed || downPressed) {
      this.takeDamage(1);
      
      const direction = leftPressed ? 'LEFT' : rightPressed ? 'RIGHT' : upPressed ? 'UP' : 'DOWN';
      this.logEvent(`Damage from ${direction} key`, this.currentHealth);
    }
  }

  // 扣血方法
  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;
      
      if (this.currentHealth === 0) {
        this.logEvent('Health depleted', 0);
      }
    }
  }

  // 自动回血方法
  autoHeal() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      
      // 更新信号
      window.__signals__.health = this.currentHealth;
      window.__signals__.healCount++;
      
      this.logEvent('Auto Heal', this.currentHealth);
    }
  }

  // 绘制血条
  drawHealthBar() {
    this.healthBarGraphics.clear();

    const barX = 50;
    const barY = 200;
    const cellWidth = 30;
    const cellHeight = 20;
    const gap = 2;

    // 绘制20格血条
    for (let i = 0; i < this.maxHealth; i++) {
      const x = barX + i * (cellWidth + gap);
      const y = barY;

      // 背景（灰色）
      this.healthBarGraphics.fillStyle(0x333333, 1);
      this.healthBarGraphics.fillRect(x, y, cellWidth, cellHeight);

      // 当前生命值（红色）
      if (i < this.currentHealth) {
        this.healthBarGraphics.fillStyle(0xff0000, 1);
        this.healthBarGraphics.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      }

      // 边框（白色）
      this.healthBarGraphics.lineStyle(1, 0xffffff, 1);
      this.healthBarGraphics.strokeRect(x, y, cellWidth, cellHeight);
    }
  }

  // 更新血条显示
  updateHealthBar() {
    this.drawHealthBar();
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  // 记录事件日志
  logEvent(event, health) {
    const logEntry = {
      timestamp: Date.now(),
      event: event,
      health: health
    };
    
    window.__signals__.logs.push(logEntry);
    console.log(JSON.stringify(logEntry));
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: HealthBarScene
};

// 创建游戏实例
new Phaser.Game(config);