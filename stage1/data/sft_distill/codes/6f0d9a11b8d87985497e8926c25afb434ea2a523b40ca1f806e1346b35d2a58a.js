// 全局信号记录
window.__signals__ = {
  currentScene: 'MenuScene',
  sceneTransitions: [],
  buttonClicks: [],
  gameStarted: false,
  timestamp: Date.now()
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.buttonBounds = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景创建
    window.__signals__.currentScene = 'MenuScene';
    window.__signals__.sceneTransitions.push({
      scene: 'MenuScene',
      action: 'created',
      time: Date.now()
    });

    // 设置背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建标题文本
    const titleText = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 绘制红色按钮
    const buttonX = 300;
    const buttonY = 300;
    const buttonWidth = 200;
    const buttonHeight = 80;

    const graphics = this.add.graphics();
    
    // 按钮阴影
    graphics.fillStyle(0x8b0000, 0.5);
    graphics.fillRoundedRect(buttonX + 5, buttonY + 5, buttonWidth, buttonHeight, 10);
    
    // 按钮主体
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    
    // 按钮边框
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);

    // 按钮文本
    const buttonText = this.add.text(400, 340, '开始游戏', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 保存按钮边界
    this.buttonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight
    };

    // 添加提示文本
    const hintText = this.add.text(400, 450, '点击红色按钮开始游戏', {
      fontSize: '20px',
      color: '#aaaaaa'
    });
    hintText.setOrigin(0.5);

    // 添加鼠标悬停效果
    this.input.on('pointermove', (pointer) => {
      if (this.isPointerOverButton(pointer)) {
        buttonText.setScale(1.1);
        this.input.setDefaultCursor('pointer');
      } else {
        buttonText.setScale(1);
        this.input.setDefaultCursor('default');
      }
    });

    // 添加点击事件
    this.input.on('pointerdown', (pointer) => {
      if (this.isPointerOverButton(pointer)) {
        // 记录按钮点击
        window.__signals__.buttonClicks.push({
          x: pointer.x,
          y: pointer.y,
          time: Date.now()
        });

        // 按钮点击动画
        buttonText.setScale(0.95);
        
        // 延迟切换场景，显示点击效果
        this.time.delayedCall(150, () => {
          this.startGame();
        });
      }
    });

    console.log('[MenuScene] 场景已创建，等待用户点击开始按钮');
  }

  isPointerOverButton(pointer) {
    const bounds = this.buttonBounds;
    return pointer.x >= bounds.x && 
           pointer.x <= bounds.x + bounds.width &&
           pointer.y >= bounds.y && 
           pointer.y <= bounds.y + bounds.height;
  }

  startGame() {
    // 记录场景切换
    window.__signals__.gameStarted = true;
    window.__signals__.sceneTransitions.push({
      scene: 'GameScene',
      action: 'transition',
      from: 'MenuScene',
      time: Date.now()
    });

    console.log('[MenuScene] 切换到游戏场景');
    
    // 切换到游戏场景
    this.scene.start('GameScene');
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景创建
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.sceneTransitions.push({
      scene: 'GameScene',
      action: 'created',
      time: Date.now()
    });

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 游戏标题
    const titleText = this.add.text(400, 80, '游戏场景', {
      fontSize: '42px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 成功提示
    const successText = this.add.text(400, 150, '场景切换成功！', {
      fontSize: '28px',
      color: '#ffff00'
    });
    successText.setOrigin(0.5);

    // 创建游戏状态显示面板
    this.createStatusPanel();

    // 创建一些游戏元素示例
    this.createGameElements();

    // 创建返回菜单按钮
    this.createBackButton();

    // 更新全局状态
    window.__signals__.gameState = {
      score: this.score,
      level: this.level,
      health: this.health
    };

    console.log('[GameScene] 游戏场景已创建');
    console.log('[Signals] 当前状态:', JSON.stringify(window.__signals__, null, 2));
  }

  createStatusPanel() {
    // 状态面板背景
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x16213e, 0.8);
    panelGraphics.fillRoundedRect(50, 220, 700, 150, 10);
    panelGraphics.lineStyle(2, 0x00ff00, 1);
    panelGraphics.strokeRoundedRect(50, 220, 700, 150, 10);

    // 状态文本
    this.scoreText = this.add.text(100, 250, `分数: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.levelText = this.add.text(100, 290, `等级: ${this.level}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.healthText = this.add.text(100, 330, `生命值: ${this.health}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 添加模拟游戏进度的按钮
    const incrementButton = this.add.text(500, 270, '[+] 增加分数', {
      fontSize: '20px',
      color: '#00ff00'
    });
    incrementButton.setInteractive({ useHandCursor: true });
    incrementButton.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`分数: ${this.score}`);
      window.__signals__.gameState.score = this.score;
      console.log('[GameScene] 分数增加:', this.score);
    });
  }

  createGameElements() {
    // 创建一些装饰性游戏元素
    const graphics = this.add.graphics();

    // 绘制几个彩色方块
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
    for (let i = 0; i < 4; i++) {
      graphics.fillStyle(colors[i], 1);
      graphics.fillCircle(150 + i * 150, 480, 30);
    }

    // 添加说明文本
    const infoText = this.add.text(400, 530, '这是游戏主场景 - 点击下方按钮返回菜单', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    infoText.setOrigin(0.5);
  }

  createBackButton() {
    // 返回按钮
    const buttonX = 300;
    const buttonY = 500;
    const buttonWidth = 200;
    const buttonHeight = 60;

    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);

    const backText = this.add.text(400, 530, '返回菜单', {
      fontSize: '24px',
      color: '#ffffff'
    });
    backText.setOrigin(0.5);
    backText.setInteractive({ useHandCursor: true });

    backText.on('pointerdown', () => {
      window.__signals__.sceneTransitions.push({
        scene: 'MenuScene',
        action: 'transition',
        from: 'GameScene',
        time: Date.now()
      });
      console.log('[GameScene] 返回菜单场景');
      this.scene.start('MenuScene');
    });

    backText.on('pointerover', () => {
      backText.setScale(1.1);
    });

    backText.on('pointerout', () => {
      backText.setScale(1);
    });
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑更新
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始状态
console.log('[Game] 游戏已启动');
console.log('[Signals] 初始状态:', JSON.stringify(window.__signals__, null, 2));