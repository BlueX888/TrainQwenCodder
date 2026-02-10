// 全局信号对象，用于验证状态
window.__signals__ = {
  currentScene: 'MainMenu',
  isPaused: false,
  playerX: 400,
  playerY: 300,
  score: 0,
  menuActions: []
};

// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    window.__signals__.currentScene = 'MainMenu';
    window.__signals__.menuActions.push({ action: 'enterMainMenu', time: Date.now() });

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'PAUSE MENU DEMO', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始按钮背景
    const startBtnBg = this.add.graphics();
    startBtnBg.fillStyle(0x16213e, 1);
    startBtnBg.fillRoundedRect(300, 320, 200, 60, 10);
    startBtnBg.lineStyle(3, 0x00ff00, 1);
    startBtnBg.strokeRoundedRect(300, 320, 200, 60, 10);

    // 开始按钮文本
    const startBtn = this.add.text(400, 350, 'START GAME', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    startBtn.setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });

    // 按钮交互
    startBtn.on('pointerover', () => {
      startBtn.setColor('#00ff00');
    });

    startBtn.on('pointerout', () => {
      startBtn.setColor('#ffffff');
    });

    startBtn.on('pointerdown', () => {
      window.__signals__.menuActions.push({ action: 'startGame', time: Date.now() });
      this.scene.start('GameScene');
    });

    // 提示文本
    const hint = this.add.text(400, 500, 'Press ESC to pause during game', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.speed = 200;
  }

  create() {
    window.__signals__.currentScene = 'Game';
    window.__signals__.isPaused = false;
    window.__signals__.score = 0;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（使用Graphics绘制方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(-20, -20, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 控制提示
    this.controlText = this.add.text(400, 550, 'Use Arrow Keys to Move | Press ESC to Pause', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    this.controlText.setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // ESC键暂停
    this.input.keyboard.on('keydown-ESC', () => {
      if (!window.__signals__.isPaused) {
        this.pauseGame();
      }
    });

    // 自动增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.scene.isPaused()) {
          window.__signals__.score += 10;
          this.scoreText.setText('Score: ' + window.__signals__.score);
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    if (!this.player) return;

    const deltaSeconds = delta / 1000;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.x -= this.speed * deltaSeconds;
    } else if (this.cursors.right.isDown) {
      this.player.x += this.speed * deltaSeconds;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= this.speed * deltaSeconds;
    } else if (this.cursors.down.isDown) {
      this.player.y += this.speed * deltaSeconds;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 更新信号
    window.__signals__.playerX = this.player.x;
    window.__signals__.playerY = this.player.y;
  }

  pauseGame() {
    window.__signals__.isPaused = true;
    window.__signals__.menuActions.push({ action: 'pause', time: Date.now() });
    this.scene.pause();
    this.scene.launch('PauseMenuScene');
  }
}

// 暂停菜单场景
class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
  }

  create() {
    window.__signals__.currentScene = 'PauseMenu';

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 菜单容器背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x16213e, 1);
    menuBg.fillRoundedRect(250, 150, 300, 300, 15);
    menuBg.lineStyle(4, 0x00ff00, 1);
    menuBg.strokeRoundedRect(250, 150, 300, 300, 15);

    // 暂停标题
    const title = this.add.text(400, 200, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建菜单按钮
    const buttons = [
      { text: 'Continue', y: 270, action: 'continue' },
      { text: 'Restart', y: 330, action: 'restart' },
      { text: 'Main Menu', y: 390, action: 'mainMenu' }
    ];

    buttons.forEach(btn => {
      // 按钮背景
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x0f3460, 1);
      btnBg.fillRoundedRect(280, btn.y - 20, 240, 50, 8);
      btnBg.lineStyle(2, 0x00ff00, 0.5);
      btnBg.strokeRoundedRect(280, btn.y - 20, 240, 50, 8);

      // 按钮文本
      const btnText = this.add.text(400, btn.y, btn.text, {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      btnText.setOrigin(0.5);
      btnText.setInteractive({ useHandCursor: true });

      // 交互效果
      btnText.on('pointerover', () => {
        btnText.setColor('#00ff00');
        btnText.setScale(1.1);
      });

      btnText.on('pointerout', () => {
        btnText.setColor('#ffffff');
        btnText.setScale(1);
      });

      btnText.on('pointerdown', () => {
        this.handleMenuAction(btn.action);
      });
    });

    // ESC键继续游戏
    this.input.keyboard.on('keydown-ESC', () => {
      this.handleMenuAction('continue');
    });
  }

  handleMenuAction(action) {
    window.__signals__.menuActions.push({ action: action, time: Date.now() });

    switch (action) {
      case 'continue':
        window.__signals__.isPaused = false;
        window.__signals__.currentScene = 'Game';
        this.scene.stop();
        this.scene.resume('GameScene');
        break;

      case 'restart':
        window.__signals__.isPaused = false;
        window.__signals__.score = 0;
        window.__signals__.playerX = 400;
        window.__signals__.playerY = 300;
        this.scene.stop();
        this.scene.stop('GameScene');
        this.scene.start('GameScene');
        break;

      case 'mainMenu':
        window.__signals__.isPaused = false;
        window.__signals__.score = 0;
        this.scene.stop();
        this.scene.stop('GameScene');
        this.scene.start('MainMenuScene');
        break;
    }
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

// 输出初始状态日志
console.log('Game initialized with signals:', JSON.stringify(window.__signals__, null, 2));