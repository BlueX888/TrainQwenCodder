// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  gameState: 'init',
  pauseCount: 0,
  resumeCount: 0,
  restartCount: 0,
  backToMenuCount: 0,
  currentScene: null,
  score: 0,
  events: []
};

function logEvent(eventType, data = {}) {
  const event = {
    type: eventType,
    timestamp: Date.now(),
    ...data
  };
  window.__signals__.events.push(event);
  console.log('[GAME EVENT]', JSON.stringify(event));
}

// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    window.__signals__.currentScene = 'MainMenuScene';
    window.__signals__.gameState = 'menu';
    logEvent('scene_start', { scene: 'MainMenuScene' });

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'PHASER GAME', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏按钮
    this.createButton(400, 300, '开始游戏', () => {
      logEvent('button_click', { button: 'start_game' });
      this.scene.start('GameScene');
    });

    // 提示文字
    const hint = this.add.text(400, 500, '游戏中按 W/A/S/D 任意键暂停', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x3498db, 1);
    bg.fillRoundedRect(-120, -30, 240, 60, 10);

    const label = this.add.text(0, 0, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(240, 60);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2980b9, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3498db, 1);
      bg.fillRoundedRect(-120, -30, 240, 60, 10);
    });

    button.on('pointerdown', callback);

    return button;
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.gameState = 'playing';
    window.__signals__.score = 0;
    logEvent('scene_start', { scene: 'GameScene' });

    // 游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一个移动的方块作为游戏内容示例
    this.player = this.add.graphics();
    this.player.fillStyle(0xe74c3c, 1);
    this.player.fillRect(-25, -25, 50, 50);
    this.player.x = 400;
    this.player.y = 300;
    this.playerVelocity = { x: 2, y: 1.5 };

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });

    // 提示文字
    this.hintText = this.add.text(400, 550, 'Press W/A/S/D to PAUSE', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    this.hintText.setOrigin(0.5);

    // 监听WASD键
    this.input.keyboard.on('keydown-W', () => this.pauseGame());
    this.input.keyboard.on('keydown-A', () => this.pauseGame());
    this.input.keyboard.on('keydown-S', () => this.pauseGame());
    this.input.keyboard.on('keydown-D', () => this.pauseGame());

    // 初始化游戏状态
    this.isPaused = false;
  }

  update(time, delta) {
    if (this.isPaused) return;

    // 移动方块
    this.player.x += this.playerVelocity.x;
    this.player.y += this.playerVelocity.y;

    // 边界碰撞
    if (this.player.x <= 25 || this.player.x >= 775) {
      this.playerVelocity.x *= -1;
      this.incrementScore();
    }
    if (this.player.y <= 25 || this.player.y >= 575) {
      this.playerVelocity.y *= -1;
      this.incrementScore();
    }
  }

  incrementScore() {
    window.__signals__.score += 10;
    this.scoreText.setText('Score: ' + window.__signals__.score);
    logEvent('score_change', { score: window.__signals__.score });
  }

  pauseGame() {
    if (this.isPaused) return;

    this.isPaused = true;
    window.__signals__.gameState = 'paused';
    window.__signals__.pauseCount++;
    logEvent('game_paused', { 
      pauseCount: window.__signals__.pauseCount,
      score: window.__signals__.score
    });

    // 暂停当前场景的更新
    this.scene.pause();

    // 启动暂停菜单场景
    this.scene.launch('PauseMenuScene');
  }

  resumeGame() {
    this.isPaused = false;
    window.__signals__.gameState = 'playing';
    window.__signals__.resumeCount++;
    logEvent('game_resumed', { 
      resumeCount: window.__signals__.resumeCount,
      score: window.__signals__.score
    });
  }
}

// 暂停菜单场景
class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
  }

  create() {
    logEvent('pause_menu_opened');

    // 半透明黑色背景遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 菜单容器
    const menuContainer = this.add.container(400, 300);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2c3e50, 1);
    menuBg.lineStyle(4, 0x3498db, 1);
    menuBg.fillRoundedRect(-200, -200, 400, 400, 15);
    menuBg.strokeRoundedRect(-200, -200, 400, 400, 15);

    // 标题
    const title = this.add.text(0, -130, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    menuContainer.add([menuBg, title]);

    // 创建三个菜单按钮
    this.createMenuButton(menuContainer, 0, -30, '继续游戏', () => {
      logEvent('button_click', { button: 'resume' });
      this.resumeGame();
    });

    this.createMenuButton(menuContainer, 0, 40, '重新开始', () => {
      logEvent('button_click', { button: 'restart' });
      this.restartGame();
    });

    this.createMenuButton(menuContainer, 0, 110, '返回主菜单', () => {
      logEvent('button_click', { button: 'back_to_menu' });
      this.backToMenu();
    });

    // ESC键也可以继续游戏
    this.input.keyboard.once('keydown-ESC', () => {
      logEvent('key_press', { key: 'ESC', action: 'resume' });
      this.resumeGame();
    });
  }

  createMenuButton(container, x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x3498db, 1);
    bg.fillRoundedRect(-150, -25, 300, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(300, 50);
    button.setInteractive();

    // 悬停效果
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2980b9, 1);
      bg.fillRoundedRect(-150, -25, 300, 50, 8);
      label.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3498db, 1);
      bg.fillRoundedRect(-150, -25, 300, 50, 8);
      label.setScale(1);
    });

    button.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(0x1f6391, 1);
      bg.fillRoundedRect(-150, -25, 300, 50, 8);
    });

    button.on('pointerup', callback);

    container.add(button);
    return button;
  }

  resumeGame() {
    // 关闭暂停菜单
    this.scene.stop();

    // 恢复游戏场景
    const gameScene = this.scene.get('GameScene');
    gameScene.resumeGame();
    this.scene.resume('GameScene');
  }

  restartGame() {
    window.__signals__.restartCount++;
    logEvent('game_restart', { 
      restartCount: window.__signals__.restartCount,
      previousScore: window.__signals__.score
    });

    // 关闭暂停菜单
    this.scene.stop();

    // 重启游戏场景
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  backToMenu() {
    window.__signals__.backToMenuCount++;
    logEvent('back_to_menu', { 
      backToMenuCount: window.__signals__.backToMenuCount,
      finalScore: window.__signals__.score
    });

    // 关闭所有场景，返回主菜单
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MainMenuScene');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MainMenuScene, GameScene, PauseMenuScene],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 初始化信号
logEvent('game_init', { 
  width: config.width, 
  height: config.height 
});