class HealthBarScene extends Phaser.Scene {
  constructor() {
    super('HealthBarScene');
    this.maxHealth = 8;
    this.currentHealth = 8;
    this.healthBlocks = [];
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.currentHealth,
      maxHealth: this.maxHealth,
      gameOver: this.gameOver,
      damageCount: 0
    };

    // 创建标题文本
    this.add.text(400, 50, 'Health Bar System', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 100, 'Press W/A/S/D to take damage', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建血条容器
    this.createHealthBar();

    // 创建键盘输入监听
    this.setupInput();

    // 创建 Game Over 文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建当前血量显示
    this.healthText = this.add.text(400, 450, `Health: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.currentHealth,
      maxHealth: this.maxHealth
    }));
  }

  createHealthBar() {
    const blockWidth = 60;
    const blockHeight = 40;
    const blockSpacing = 10;
    const totalWidth = (blockWidth + blockSpacing) * this.maxHealth - blockSpacing;
    const startX = (800 - totalWidth) / 2;
    const startY = 200;

    // 创建 8 个血条格子
    for (let i = 0; i < this.maxHealth; i++) {
      const x = startX + i * (blockWidth + blockSpacing);
      const y = startY;

      // 创建背景（灰色边框）
      const background = this.add.graphics();
      background.lineStyle(3, 0x333333, 1);
      background.strokeRect(x, y, blockWidth, blockHeight);

      // 创建填充（绿色）
      const fill = this.add.graphics();
      fill.fillStyle(0x00ff00, 1);
      fill.fillRect(x + 3, y + 3, blockWidth - 6, blockHeight - 6);

      this.healthBlocks.push({
        background: background,
        fill: fill,
        active: true
      });
    }
  }

  setupInput() {
    // 创建 WASD 键位
    const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    keyW.on('down', () => this.takeDamage('W'));
    keyA.on('down', () => this.takeDamage('A'));
    keyS.on('down', () => this.takeDamage('S'));
    keyD.on('down', () => this.takeDamage('D'));
  }

  takeDamage(key) {
    // 如果游戏已结束，不再扣血
    if (this.gameOver) {
      return;
    }

    // 扣除 1 点生命值
    if (this.currentHealth > 0) {
      this.currentHealth--;
      window.__signals__.health = this.currentHealth;
      window.__signals__.damageCount++;

      // 更新血条显示
      this.updateHealthBar();

      // 更新文本显示
      this.healthText.setText(`Health: ${this.currentHealth}/${this.maxHealth}`);

      console.log(JSON.stringify({
        event: 'damage_taken',
        key: key,
        health: this.currentHealth,
        maxHealth: this.maxHealth
      }));

      // 检查是否死亡
      if (this.currentHealth === 0) {
        this.triggerGameOver();
      }
    }
  }

  updateHealthBar() {
    // 从右到左更新血条（最新损失的血在右侧）
    const lostHealth = this.maxHealth - this.currentHealth;
    
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.healthBlocks[i];
      const shouldBeActive = i < this.currentHealth;

      if (shouldBeActive && !block.active) {
        // 恢复绿色（虽然本例不会恢复）
        block.fill.clear();
        block.fill.fillStyle(0x00ff00, 1);
        const x = block.background.x;
        const y = block.background.y;
        block.fill.fillRect(x + 3, y + 3, 54, 34);
        block.active = true;
      } else if (!shouldBeActive && block.active) {
        // 变为灰色
        block.fill.clear();
        block.fill.fillStyle(0x555555, 1);
        const bounds = block.background.getBounds();
        block.fill.fillRect(bounds.x + 3, bounds.y + 3, 54, 34);
        block.active = false;
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    // 显示 Game Over 文本
    this.gameOverText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log(JSON.stringify({
      event: 'game_over',
      health: this.currentHealth,
      damageCount: window.__signals__.damageCount
    }));
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: HealthBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);