// 初始化信号系统
window.__signals__ = {
  currentScene: 'MainMenu',
  gameScore: 0,
  pauseCount: 0,
  menuActions: [],
  timestamp: Date.now()
};

// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    window.__signals__.currentScene = 'MainMenu';
    window.__signals__.menuActions.push({ action: 'enterMainMenu', time: Date.now() });

    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height / 3, 'GAME MENU', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏按钮
    this.createButton(width / 2, height / 2, '开始游戏', () => {
      window.__signals__.menuActions.push({ action: 'startGame', time: Date.now() });
      this.scene.start('Game');
    });

    // 提示文本
    const hint = this.add.text(width / 2, height * 0.8, '游戏中按鼠标右键暂停', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 10);
    bg.lineStyle(2, 0x0f3460, 1);
    bg.strokeRoundedRect(-120, -30, 240, 60, 10);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(240, 60);
    button.setInteractive(new Phaser.Geom.Rectangle(-120, -30, 240, 60), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x0f3460, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      bg.lineStyle(2, 0xe94560, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 10);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x16213e, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
      bg.lineStyle(2, 0x0f3460, 1);
      bg.strokeRoundedRect(-120, -30, 240, 60, 10);
    });

    button.on('pointerdown', callback);

    return button;
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
    this.score = 0;
    this.isPaused = false;
  }

  create() {
    window.__signals__.currentScene = 'Game';
    window.__signals__.gameScore = 0;
    window.__signals__.menuActions.push({ action: 'enterGame', time: Date.now() });

    const { width, height } = this.cameras.main;

    // 游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 创建一个移动的方块作为游戏内容示例
    this.player = this.add.graphics();
    this.player.fillStyle(0xe94560, 1);
    this.player.fillRect(-25, -25, 50, 50);
    this.player.x = width / 2;
    this.player.y = height / 2;

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.isPaused) {
        this.showPauseMenu();
      }
    });

    // 提示文本
    this.hintText = this.add.text(width / 2, height - 40, '使用方向键移动 | 右键暂停', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 自动增加分数（模拟游戏进行）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        window.__signals__.gameScore = this.score;
      },
      loop: true
    });
  }

  update() {
    if (this.isPaused) return;

    const speed = 5;

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
    }
  }

  showPauseMenu() {
    this.isPaused = true;
    this.scene.pause();
    window.__signals__.pauseCount++;
    window.__signals__.menuActions.push({ 
      action: 'pauseGame', 
      score: this.score, 
      time: Date.now() 
    });

    const { width, height } = this.cameras.main;

    // 创建暂停菜单容器
    this.pauseContainer = this.add.container(0, 0);
    this.pauseContainer.setDepth(1000);

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    this.pauseContainer.add(overlay);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x1a1a2e, 1);
    menuBg.fillRoundedRect(width / 2 - 200, height / 2 - 250, 400, 500, 15);
    menuBg.lineStyle(3, 0xe94560, 1);
    menuBg.strokeRoundedRect(width / 2 - 200, height / 2 - 250, 400, 500, 15);
    this.pauseContainer.add(menuBg);

    // 暂停标题
    const pauseTitle = this.add.text(width / 2, height / 2 - 180, '游戏暂停', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);
    this.pauseContainer.add(pauseTitle);

    // 当前分数显示
    const scoreDisplay = this.add.text(width / 2, height / 2 - 120, `当前分数: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    scoreDisplay.setOrigin(0.5);
    this.pauseContainer.add(scoreDisplay);

    // 继续游戏按钮
    const continueBtn = this.createPauseButton(width / 2, height / 2 - 40, '继续游戏', () => {
      window.__signals__.menuActions.push({ action: 'resume', time: Date.now() });
      this.resumeGame();
    });
    this.pauseContainer.add(continueBtn);

    // 重新开始按钮
    const restartBtn = this.createPauseButton(width / 2, height / 2 + 50, '重新开始', () => {
      window.__signals__.menuActions.push({ action: 'restart', time: Date.now() });
      this.pauseContainer.destroy();
      this.scene.restart();
    });
    this.pauseContainer.add(restartBtn);

    // 返回主菜单按钮
    const mainMenuBtn = this.createPauseButton(width / 2, height / 2 + 140, '返回主菜单', () => {
      window.__signals__.menuActions.push({ action: 'backToMainMenu', time: Date.now() });
      this.pauseContainer.destroy();
      this.scene.stop();
      this.scene.start('MainMenu');
    });
    this.pauseContainer.add(mainMenuBtn);
  }

  createPauseButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x16213e, 1);
    bg.fillRoundedRect(-150, -30, 300, 60, 10);
    bg.lineStyle(2, 0x0f3460, 1);
    bg.strokeRoundedRect(-150, -30, 300, 60, 10);

    const label = this.add.text(0, 0, text, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(300, 60);
    button.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x0f3460, 1);
      bg.fillRoundedRect(-150, -30, 300, 60, 10);
      bg.lineStyle(2, 0xe94560, 1);
      bg.strokeRoundedRect(-150, -30, 300, 60, 10);
      label.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x16213e, 1);
      bg.fillRoundedRect(-150, -30, 300, 60, 10);
      bg.lineStyle(2, 0x0f3460, 1);
      bg.strokeRoundedRect(-150, -30, 300, 60, 10);
      label.setScale(1);
    });

    button.on('pointerdown', callback);

    return button;
  }

  resumeGame() {
    this.isPaused = false;
    this.pauseContainer.destroy();
    this.scene.resume();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MainMenuScene, GameScene],
  input: {
    mouse: {
      target: null,
      capture: true
    }
  }
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('Game initialized. Signals:', JSON.stringify(window.__signals__, null, 2));