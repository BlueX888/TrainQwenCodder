// 全局信号记录
window.__signals__ = {
  events: [],
  gameState: {
    score: 0,
    isPaused: false,
    currentScene: 'MainMenu'
  }
};

function logSignal(event, data) {
  const signal = {
    timestamp: Date.now(),
    event: event,
    data: data
  };
  window.__signals__.events.push(signal);
  console.log('[SIGNAL]', JSON.stringify(signal));
}

// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    logSignal('scene_start', { scene: 'MainMenuScene' });
    window.__signals__.gameState.currentScene = 'MainMenu';

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'GAME MENU', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏按钮
    const startButton = this.createButton(400, 300, 'Start Game', () => {
      logSignal('button_click', { button: 'start_game' });
      this.scene.start('GameScene');
    });

    // 说明文字
    const instructions = this.add.text(400, 450, 'Press ESC to pause during game\nUse WASD to move (demo)', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add.graphics();
    const buttonText = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    const bounds = buttonText.getBounds();
    const padding = 20;

    button.fillStyle(0x4a4a6a, 1);
    button.fillRoundedRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2,
      10
    );

    buttonText.setDepth(1);

    // 交互区域
    const zone = this.add.zone(x, y, bounds.width + padding * 2, bounds.height + padding * 2);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x6a6a8a, 1);
      button.fillRoundedRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
        10
      );
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4a4a6a, 1);
      button.fillRoundedRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
        10
      );
    });

    zone.on('pointerdown', callback);

    return { button, buttonText, zone };
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.playerSpeed = 200;
  }

  create() {
    logSignal('scene_start', { scene: 'GameScene' });
    window.__signals__.gameState.currentScene = 'Game';
    window.__signals__.gameState.score = 0;
    window.__signals__.gameState.isPaused = false;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（使用Graphics绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(0, 0, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 提示文字
    this.hintText = this.add.text(400, 550, 'WASD to move | ESC to pause', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    // ESC键暂停
    this.cursors.pause.on('down', () => {
      this.pauseGame();
    });

    // 创建一些收集物
    this.collectibles = this.add.group();
    this.spawnCollectibles();

    // 定时生成收集物
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnCollectibles,
      callbackScope: this,
      loop: true
    });
  }

  spawnCollectibles() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 15, 15);
    graphics.generateTexture('collectible', 15, 15);
    graphics.destroy();

    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 500);
      const collectible = this.add.sprite(x, y, 'collectible');
      this.collectibles.add(collectible);
    }
  }

  pauseGame() {
    logSignal('game_pause', { score: this.score });
    window.__signals__.gameState.isPaused = true;
    this.scene.pause();
    this.scene.launch('PauseMenuScene', { callingScene: this });
  }

  update() {
    if (!this.player) return;

    // 玩家移动
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.playerSpeed;
    }

    this.player.x += velocityX * 0.016;
    this.player.y += velocityY * 0.016;

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 收集物碰撞检测
    this.collectibles.children.entries.forEach((collectible) => {
      if (Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        collectible.x, collectible.y
      ) < 25) {
        collectible.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        window.__signals__.gameState.score = this.score;
        logSignal('collect_item', { score: this.score });
      }
    });
  }

  resetGame() {
    this.score = 0;
    this.scoreText.setText('Score: 0');
    window.__signals__.gameState.score = 0;
    this.player.setPosition(400, 300);
    this.collectibles.clear(true, true);
    this.spawnCollectibles();
    logSignal('game_reset', {});
  }
}

// 暂停菜单场景
class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
  }

  init(data) {
    this.callingScene = data.callingScene;
  }

  create() {
    logSignal('scene_start', { scene: 'PauseMenuScene' });

    // 半透明背景遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2a2a4a, 1);
    menuBg.fillRoundedRect(250, 150, 300, 300, 15);
    menuBg.lineStyle(3, 0x6a6a8a, 1);
    menuBg.strokeRoundedRect(250, 150, 300, 300, 15);

    // 标题
    const title = this.add.text(400, 200, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 菜单选项
    this.createMenuItem(400, 280, 'Continue', () => {
      logSignal('menu_click', { action: 'continue' });
      this.resumeGame();
    });

    this.createMenuItem(400, 340, 'Restart', () => {
      logSignal('menu_click', { action: 'restart' });
      this.restartGame();
    });

    this.createMenuItem(400, 400, 'Main Menu', () => {
      logSignal('menu_click', { action: 'main_menu' });
      this.returnToMainMenu();
    });

    // ESC键继续游戏
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      this.resumeGame();
    });
  }

  createMenuItem(x, y, text, callback) {
    const menuText = this.add.text(x, y, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    menuText.setOrigin(0.5);

    const bounds = menuText.getBounds();
    const padding = 15;

    const bg = this.add.graphics();
    bg.fillStyle(0x3a3a5a, 1);
    bg.fillRoundedRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2,
      8
    );

    menuText.setDepth(1);

    const zone = this.add.zone(x, y, bounds.width + padding * 2, bounds.height + padding * 2);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x5a5a7a, 1);
      bg.fillRoundedRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
        8
      );
      menuText.setStyle({ color: '#ffff00' });
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3a3a5a, 1);
      bg.fillRoundedRect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
        8
      );
      menuText.setStyle({ color: '#ffffff' });
    });

    zone.on('pointerdown', callback);

    return { bg, menuText, zone };
  }

  resumeGame() {
    logSignal('game_resume', {});
    window.__signals__.gameState.isPaused = false;
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  restartGame() {
    logSignal('game_restart', {});
    window.__signals__.gameState.isPaused = false;
    window.__signals__.gameState.score = 0;
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  returnToMainMenu() {
    logSignal('return_main_menu', {});
    window.__signals__.gameState.isPaused = false;
    window.__signals__.gameState.currentScene = 'MainMenu';
    window.__signals__.gameState.score = 0;
    this.