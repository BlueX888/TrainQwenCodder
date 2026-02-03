// 健康系统类
class HealthSystem {
  constructor(maxHealth) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.listeners = [];
  }

  damage(amount) {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    if (oldHealth !== this.currentHealth) {
      this.notifyListeners();
      return true;
    }
    return false;
  }

  heal(amount) {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    if (oldHealth !== this.currentHealth) {
      this.notifyListeners();
      return true;
    }
    return false;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentHealth, this.maxHealth));
  }

  getHealth() {
    return this.currentHealth;
  }

  getMaxHealth() {
    return this.maxHealth;
  }
}

// 血条UI类
class HealthBar {
  constructor(scene, x, y, healthSystem) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.healthSystem = healthSystem;
    this.cellWidth = 30;
    this.cellHeight = 20;
    this.cellGap = 4;
    this.cells = [];

    this.createCells();
    this.updateDisplay();

    // 监听健康值变化
    this.healthSystem.onChange(() => this.updateDisplay());
  }

  createCells() {
    const maxHealth = this.healthSystem.getMaxHealth();
    const cellsPerRow = 10;

    for (let i = 0; i < maxHealth; i++) {
      const row = Math.floor(i / cellsPerRow);
      const col = i % cellsPerRow;
      const cellX = this.x + col * (this.cellWidth + this.cellGap);
      const cellY = this.y + row * (this.cellHeight + this.cellGap);

      const cell = this.scene.add.graphics();
      cell.setPosition(cellX, cellY);
      this.cells.push(cell);
    }
  }

  updateDisplay() {
    const currentHealth = this.healthSystem.getHealth();

    this.cells.forEach((cell, index) => {
      cell.clear();

      // 绘制边框
      cell.lineStyle(2, 0x333333, 1);
      cell.strokeRect(0, 0, this.cellWidth, this.cellHeight);

      // 填充颜色
      if (index < currentHealth) {
        // 有血：红色
        cell.fillStyle(0xff0000, 1);
      } else {
        // 无血：暗灰色
        cell.fillStyle(0x333333, 0.3);
      }
      cell.fillRect(2, 2, this.cellWidth - 4, this.cellHeight - 4);
    });
  }

  destroy() {
    this.cells.forEach(cell => cell.destroy());
    this.cells = [];
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.healthSystem = null;
    this.healthBar = null;
    this.healTimer = null;
    this.keyPressDebounce = {};
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      health: 20,
      maxHealth: 20,
      damageCount: 0,
      healCount: 0,
      events: []
    };

    // 创建健康系统
    this.healthSystem = new HealthSystem(20);

    // 创建血条UI
    this.healthBar = new HealthBar(this, 50, 50, this.healthSystem);

    // 添加标题文本
    this.add.text(50, 20, 'Health System Demo', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 添加说明文本
    this.add.text(50, 120, 'Press Arrow Keys to take damage (-1 HP)', {
      fontSize: '16px',
      color: '#cccccc'
    });

    this.add.text(50, 145, 'Auto heal +1 HP every 0.5 seconds', {
      fontSize: '16px',
      color: '#cccccc'
    });

    // 添加生命值显示文本
    this.healthText = this.add.text(50, 180, '', {
      fontSize: '18px',
      color: '#ffff00'
    });
    this.updateHealthText();

    // 监听方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听健康值变化以更新文本和信号
    this.healthSystem.onChange((current, max) => {
      this.updateHealthText();
      this.updateSignals();
    });

    // 设置自动回血定时器（每0.5秒）
    this.healTimer = this.time.addEvent({
      delay: 500,
      callback: this.autoHeal,
      callbackScope: this,
      loop: true
    });

    // 初始化按键防抖
    ['up', 'down', 'left', 'right'].forEach(key => {
      this.keyPressDebounce[key] = 0;
    });
  }

  update(time, delta) {
    // 检测方向键按下（带防抖，避免连续扣血）
    const debounceTime = 200; // 200ms防抖

    if (this.cursors.up.isDown && time > this.keyPressDebounce.up) {
      this.takeDamage('UP');
      this.keyPressDebounce.up = time + debounceTime;
    }

    if (this.cursors.down.isDown && time > this.keyPressDebounce.down) {
      this.takeDamage('DOWN');
      this.keyPressDebounce.down = time + debounceTime;
    }

    if (this.cursors.left.isDown && time > this.keyPressDebounce.left) {
      this.takeDamage('LEFT');
      this.keyPressDebounce.left = time + debounceTime;
    }

    if (this.cursors.right.isDown && time > this.keyPressDebounce.right) {
      this.takeDamage('RIGHT');
      this.keyPressDebounce.right = time + debounceTime;
    }
  }

  takeDamage(keyName) {
    if (this.healthSystem.damage(1)) {
      const event = {
        type: 'damage',
        key: keyName,
        health: this.healthSystem.getHealth(),
        timestamp: Date.now()
      };
      window.__signals__.events.push(event);
      window.__signals__.damageCount++;
      console.log('Damage taken:', event);
    }
  }

  autoHeal() {
    if (this.healthSystem.heal(1)) {
      const event = {
        type: 'heal',
        amount: 1,
        health: this.healthSystem.getHealth(),
        timestamp: Date.now()
      };
      window.__signals__.events.push(event);
      window.__signals__.healCount++;
      console.log('Auto heal:', event);
    }
  }

  updateHealthText() {
    const current = this.healthSystem.getHealth();
    const max = this.healthSystem.getMaxHealth();
    this.healthText.setText(`Health: ${current} / ${max}`);
  }

  updateSignals() {
    window.__signals__.health = this.healthSystem.getHealth();
    window.__signals__.maxHealth = this.healthSystem.getMaxHealth();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);