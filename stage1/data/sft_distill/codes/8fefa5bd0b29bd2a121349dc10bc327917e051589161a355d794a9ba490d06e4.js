// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.buttonBounds = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 绘制背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e, 1);
    bgGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 绘制标题
    const title = this.add.text(centerX, centerY - 100, 'PHASER GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 定义按钮尺寸和位置
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = centerY - buttonHeight / 2;

    this.buttonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };

    // 绘制青色按钮
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x00CED1, 1); // 青色 (Dark Turquoise)
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    
    // 添加按钮边框
    buttonGraphics.lineStyle(3, 0xffffff, 1);
    buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);

    // 添加按钮文本
    const buttonText = this.add.text(centerX, centerY, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 添加悬停效果的图形对象
    this.hoverGraphics = this.add.graphics();
    this.hoverGraphics.setVisible(false);

    // 监听鼠标移动事件（悬停效果）
    this.input.on('pointermove', (pointer) => {
      if (this.isPointerOverButton(pointer)) {
        this.hoverGraphics.clear();
        this.hoverGraphics.fillStyle(0x00FFFF, 0.3); // 半透明青色
        this.hoverGraphics.fillRoundedRect(
          this.buttonBounds.x,
          this.buttonBounds.y,
          this.buttonBounds.width,
          this.buttonBounds.height,
          10
        );
        this.hoverGraphics.setVisible(true);
        this.input.setDefaultCursor('pointer');
      } else {
        this.hoverGraphics.setVisible(false);
        this.input.setDefaultCursor('default');
      }
    });

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      if (this.isPointerOverButton(pointer)) {
        // 点击效果
        buttonGraphics.clear();
        buttonGraphics.fillStyle(0x008B8B, 1); // 深青色
        buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        buttonGraphics.lineStyle(3, 0xffffff, 1);
        buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);

        // 延迟切换场景，让点击效果可见
        this.time.delayedCall(150, () => {
          this.scene.start('GameScene');
        });
      }
    });

    // 添加提示文本
    const hint = this.add.text(centerX, centerY + 100, '点击按钮开始游戏', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }

  isPointerOverButton(pointer) {
    return pointer.x >= this.buttonBounds.x &&
           pointer.x <= this.buttonBounds.x + this.buttonBounds.width &&
           pointer.y >= this.buttonBounds.y &&
           pointer.y <= this.buttonBounds.y + this.buttonBounds.height;
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameStarted = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    this.gameStarted = true;

    // 绘制游戏背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x0f0f23, 1);
    bgGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // 添加游戏标题
    const gameTitle = this.add.text(400, 50, 'GAME SCENE', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00CED1',
      fontStyle: 'bold'
    });
    gameTitle.setOrigin(0.5);

    // 创建状态显示面板
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x1a1a3e, 1);
    panelGraphics.fillRoundedRect(50, 100, 700, 100, 10);
    panelGraphics.lineStyle(2, 0x00CED1, 1);
    panelGraphics.strokeRoundedRect(50, 100, 700, 100, 10);

    // 显示游戏状态
    this.scoreText = this.add.text(100, 130, `Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.levelText = this.add.text(100, 160, `Level: ${this.level}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.healthText = this.add.text(400, 130, `Health: ${this.health}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });

    // 创建一个简单的玩家对象（使用 Graphics）
    this.playerGraphics = this.add.graphics();
    this.playerGraphics.fillStyle(0x00CED1, 1);
    this.playerGraphics.fillCircle(400, 350, 20);
    this.playerGraphics.lineStyle(2, 0xffffff, 1);
    this.playerGraphics.strokeCircle(400, 350, 20);

    // 添加游戏说明
    const instructions = this.add.text(400, 500, '游戏已开始！\n状态数据已初始化\nScore: 0 | Level: 1 | Health: 100', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#cccccc',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // 添加返回菜单按钮
    const backButtonX = 350;
    const backButtonY = 550;
    const backButtonWidth = 100;
    const backButtonHeight = 40;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0x444444, 1);
    backButtonGraphics.fillRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 5);
    backButtonGraphics.lineStyle(2, 0x00CED1, 1);
    backButtonGraphics.strokeRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 5);

    const backButtonText = this.add.text(400, 570, '返回菜单', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5);

    // 返回菜单按钮点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x >= backButtonX && pointer.x <= backButtonX + backButtonWidth &&
          pointer.y >= backButtonY && pointer.y <= backButtonY + backButtonHeight) {
        this.scene.start('MenuScene');
      }
    });

    // 模拟游戏进度（每秒增加分数）
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameState,
      callbackScope: this,
      loop: true
    });

    // 输出验证信息到控制台
    console.log('GameScene started with initial state:', {
      score: this.score,
      level: this.level,
      health: this.health,
      gameStarted: this.gameStarted
    });
  }

  updateGameState() {
    // 更新游戏状态
    this.score += 10;
    
    if (this.score % 50 === 0 && this.score > 0) {
      this.level += 1;
    }

    // 更新显示文本
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
    this.healthText.setText(`Health: ${this.health}`);

    // 输出状态到控制台用于验证
    console.log('Game state updated:', {
      score: this.score,
      level: this.level,
      health: this.health
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（当前为空，可扩展）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // MenuScene 作为第一个场景自动启动
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);