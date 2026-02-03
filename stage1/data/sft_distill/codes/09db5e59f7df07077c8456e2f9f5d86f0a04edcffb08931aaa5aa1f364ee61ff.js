// 全局信号记录
window.__signals__ = {
  events: [],
  gameState: 'idle',
  score: 0,
  pauseCount: 0
};

function logSignal(event, data = {}) {
  const signal = {
    timestamp: Date.now(),
    event: event,
    ...data
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
    logSignal('scene_started', { scene: 'MainMenuScene' });
    window.__signals__.gameState = 'mainMenu';

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'GAME MENU', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏按钮
    this.createButton(400, 300, 'Start Game', () => {
      logSignal('button_clicked', { button: 'start_game' });
      this.scene.start('GameScene');
    });

    // 说明文字
    const instructions = this.add.text(400, 450, 'Right Click to Pause', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    instructions.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x4a4a8a, 1);
    button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    const hitArea = new Phaser.Geom.Rectangle(x - 120, y - 30, 240, 60);
    button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x6a6aaa, 1);
      button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4a4a8a, 1);
      button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
    });

    button.on('pointerdown', callback);

    return { button, buttonText };
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameTime = 0;
  }

  create() {
    logSignal('scene_started', { scene: 'GameScene' });
    window.__signals__.gameState = 'playing';
    window.__signals__.score = 0;

    // 游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一个简单的玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = 400;
    this.player.y = 300;

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 时间显示
    this.timeText = this.add.text(20, 50, 'Time: 0s', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听鼠标右键
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown() && !this.isPaused) {
        this.showPauseMenu();
      }
    });

    // 禁用右键菜单
    this.input.mouse.disableContextMenu();

    // 每秒增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isPaused) {
          this.score += 10;
          window.__signals__.score = this.score;
          this.scoreText.setText('Score: ' + this.score);
          logSignal('score_updated', { score: this.score });
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.isPaused) return;

    this.gameTime += delta;
    this.timeText.setText('Time: ' + Math.floor(this.gameTime / 1000) + 's');

    // 玩家移动
    const speed = 200 * (delta / 1000);
    if (this.cursors.left.isDown) {
      this.player.x = Math.max(20, this.player.x - speed);
    }
    if (this.cursors.right.isDown) {
      this.player.x = Math.min(780, this.player.x + speed);
    }
    if (this.cursors.up.isDown) {
      this.player.y = Math.max(20, this.player.y - speed);
    }
    if (this.cursors.down.isDown) {
      this.player.y = Math.min(580, this.player.y + speed);
    }
  }

  showPauseMenu() {
    this.isPaused = true;
    window.__signals__.gameState = 'paused';
    window.__signals__.pauseCount++;
    logSignal('game_paused', { 
      score: this.score, 
      pauseCount: window.__signals__.pauseCount 
    });

    // 半透明遮罩
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);

    // 菜单背景
    this.pauseMenuBg = this.add.graphics();
    this.pauseMenuBg.fillStyle(0x2a2a4a, 1);
    this.pauseMenuBg.fillRoundedRect(250, 150, 300, 300, 15);
    this.pauseMenuBg.lineStyle(3, 0x6a6aaa, 1);
    this.pauseMenuBg.strokeRoundedRect(250, 150, 300, 300, 15);
    this.pauseMenuBg.setDepth(101);

    // 暂停标题
    this.pauseTitle = this.add.text(400, 200, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.pauseTitle.setOrigin(0.5);
    this.pauseTitle.setDepth(102);

    // 创建三个按钮
    this.pauseButtons = [];

    // 继续按钮
    this.createPauseButton(400, 270, 'Continue', () => {
      logSignal('button_clicked', { button: 'continue' });
      this.hidePauseMenu();
    });

    // 重新开始按钮
    this.createPauseButton(400, 340, 'Restart', () => {
      logSignal('button_clicked', { button: 'restart' });
      this.hidePauseMenu();
      this.scene.restart();
    });

    // 返回主菜单按钮
    this.createPauseButton(400, 410, 'Main Menu', () => {
      logSignal('button_clicked', { button: 'main_menu' });
      this.hidePauseMenu();
      this.scene.start('MainMenuScene');
    });
  }

  createPauseButton(x, y, text, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x4a4a8a, 1);
    button.fillRoundedRect(x - 100, y - 25, 200, 50, 8);
    button.setDepth(102);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(103);

    const hitArea = new Phaser.Geom.Rectangle(x - 100, y - 25, 200, 50);
    button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x6a6aaa, 1);
      button.fillRoundedRect(x - 100, y - 25, 200, 50, 8);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4a4a8a, 1);
      button.fillRoundedRect(x - 100, y - 25, 200, 50, 8);
    });

    button.on('pointerdown', callback);

    this.pauseButtons.push({ button, buttonText });
  }

  hidePauseMenu() {
    this.isPaused = false;
    window.__signals__.gameState = 'playing';
    logSignal('game_resumed', { score: this.score });

    // 清除暂停菜单元素
    if (this.pauseOverlay) this.pauseOverlay.destroy();
    if (this.pauseMenuBg) this.pauseMenuBg.destroy();
    if (this.pauseTitle) this.pauseTitle.destroy();

    this.pauseButtons.forEach(({ button, buttonText }) => {
      button.destroy();
      buttonText.destroy();
    });
    this.pauseButtons = [];
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MainMenuScene, GameScene],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

logSignal('game_initialized', { width: 800, height: 600 });