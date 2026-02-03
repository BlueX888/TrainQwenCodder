class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 10;
    this.currentHealth = 10;
    this.healthBarCells = [];
    this.canTakeDamage = true;
    this.damageDelay = 200; // 防止按键过快连续扣血
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
    this.add.text(400, 100, '按方向键扣血，每4秒自动回复1点', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建生命值显示文本
    this.healthText = this.add.text(400, 150, `生命值: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建自动回血定时器（每4秒执行一次）
    this.healTimer = this.time.addEvent({
      delay: 4000,
      callback: this.healHealth,
      callbackScope: this,
      loop: true
    });

    // 创建状态显示文本
    this.statusText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 添加按键事件监听
    this.input.keyboard.on('keydown', this.handleKeyPress, this);
  }

  createHealthBar() {
    const cellWidth = 50;
    const cellHeight = 30;
    const cellSpacing = 5;
    const startX = 400 - (this.maxHealth * (cellWidth + cellSpacing)) / 2;
    const startY = 250;

    // 清空旧的血条格子
    this.healthBarCells.forEach(cell => cell.destroy());
    this.healthBarCells = [];

    // 创建血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (cellWidth + cellSpacing);
      const y = startY;

      // 创建背景框（边框）
      const border = this.add.graphics();
      border.lineStyle(2, 0xffffff, 1);
      border.strokeRect(x, y, cellWidth, cellHeight);

      // 创建填充格子
      const fill = this.add.graphics();
      this.healthBarCells.push({
        border: border,
        fill: fill,
        x: x,
        y: y,
        width: cellWidth,
        height: cellHeight
      });
    }

    // 初始化血条显示
    this.updateHealthBar();
  }

  updateHealthBar() {
    // 更新每个格子的填充状态
    this.healthBarCells.forEach((cell, index) => {
      cell.fill.clear();
      
      if (index < this.currentHealth) {
        // 根据生命值比例显示不同颜色
        let color;
        const healthPercent = this.currentHealth / this.maxHealth;
        if (healthPercent > 0.6) {
          color = 0x00ff00; // 绿色（健康）
        } else if (healthPercent > 0.3) {
          color = 0xffff00; // 黄色（警告）
        } else {
          color = 0xff0000; // 红色（危险）
        }
        
        cell.fill.fillStyle(color, 1);
        cell.fill.fillRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
      }
    });

    // 更新生命值文本
    this.healthText.setText(`生命值: ${this.currentHealth}/${this.maxHealth}`);
    
    // 更新文本颜色
    const healthPercent = this.currentHealth / this.maxHealth;
    if (healthPercent > 0.6) {
      this.healthText.setColor('#00ff00');
    } else if (healthPercent > 0.3) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ff0000');
    }
  }

  handleKeyPress(event) {
    // 检查是否是方向键
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if (arrowKeys.includes(event.key) && this.canTakeDamage) {
      this.takeDamage(1);
      
      // 防止连续扣血
      this.canTakeDamage = false;
      this.time.delayedCall(this.damageDelay, () => {
        this.canTakeDamage = true;
      });
    }
  }

  takeDamage(amount) {
    if (this.currentHealth > 0) {
      this.currentHealth = Math.max(0, this.currentHealth - amount);
      this.updateHealthBar();
      this.showStatus(`受到伤害 -${amount}`, '#ff0000');
      
      if (this.currentHealth === 0) {
        this.showStatus('生命值耗尽！', '#ff0000');
      }
    }
  }

  healHealth() {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 1);
      this.updateHealthBar();
      this.showStatus('自动回复 +1', '#00ff00');
    }
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
    
    // 2秒后清除状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
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
new Phaser.Game(config);