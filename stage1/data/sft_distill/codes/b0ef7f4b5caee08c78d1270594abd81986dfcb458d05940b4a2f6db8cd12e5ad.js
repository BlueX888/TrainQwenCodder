class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建标题文本
    this.add.text(400, 50, 'Health Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.add.text(400, 100, 'Press W/A/S/D to lose health', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 设置键盘输入
    this.setupInput();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 显示当前血量文本
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    const blockWidth = 60;
    const blockHeight = 30;
    const blockSpacing = 10;
    const startX = 400 - (this.maxHealth * (blockWidth + blockSpacing) - blockSpacing) / 2;
    const startY = 200;

    // 创建 8 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建血条格子的 Graphics 对象
      const block = this.add.graphics();
      
      // 绘制紫色填充矩形
      block.fillStyle(0x9933ff, 1);
      block.fillRect(x, y, blockWidth, blockHeight);
      
      // 绘制白色边框
      block.lineStyle(2, 0xffffff, 1);
      block.strokeRect(x, y, blockWidth, blockHeight);

      // 存储格子信息
      this.healthBlocks.push({
        graphics: block,
        x: x,
        y: y,
        width: blockWidth,
        height: blockHeight,
        active: true
      });
    }
  }

  setupInput() {
    // 创建 WASD 键
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

  takeDamage() {
    // 如果游戏已结束，不再扣血
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.currentHealth > 0) {
      this.currentHealth--;
      this.updateHealthBar();
      this.updateHealthText();

      // 检查是否死亡
      if (this.currentHealth <= 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 更新血条显示
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const isActive = i < this.currentHealth;

      // 清除之前的绘制
      block.graphics.clear();

      if (isActive) {
        // 绘制紫色（有血）
        block.graphics.fillStyle(0x9933ff, 1);
        block.graphics.fillRect(block.x, block.y, block.width, block.height);
      } else {
        // 绘制灰色（无血）
        block.graphics.fillStyle(0x333333, 1);
        block.graphics.fillRect(block.x, block.y, block.width, block.height);
      }

      // 绘制边框
      block.graphics.lineStyle(2, 0xffffff, 1);
      block.graphics.strokeRect(block.x, block.y, block.width, block.height);
    }
  }

  updateHealthText() {
    this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  triggerGameOver() {
    this.gameOver = true;
    this.gameOverText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Over! Health reached 0');
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
  backgroundColor: '#222222',
  scene: HealthBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentHealth: scene.currentHealth,
    maxHealth: scene.maxHealth,
    gameOver: scene.gameOver
  };
};