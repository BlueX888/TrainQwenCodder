class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.moveCounter = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建一个移动的方块作为游戏运行指示器
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 50, 50);
    graphics.generateTexture('playerTex', 50, 50);
    graphics.destroy();

    this.player = this.add.sprite(100, 300, 'playerTex');
    this.player.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(10, 10, 'Move Counter: 0\nPress Arrow Keys to Pause/Resume', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.statusText.setDepth(10);

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 监听方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加方向键按下事件监听
    this.input.keyboard.on('keydown-UP', () => this.togglePause());
    this.input.keyboard.on('keydown-DOWN', () => this.togglePause());
    this.input.keyboard.on('keydown-LEFT', () => this.togglePause());
    this.input.keyboard.on('keydown-RIGHT', () => this.togglePause());

    // 设置移动速度
    this.moveSpeed = 2;
  }

  createPauseOverlay() {
    // 创建半透明白色背景
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0xffffff, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '64px',
      color: '#000000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加提示文字
    this.resumeHint = this.add.text(400, 380, 'Press any Arrow Key to Resume', {
      fontSize: '24px',
      color: '#333333'
    });
    this.resumeHint.setOrigin(0.5);
    this.resumeHint.setDepth(101);
    this.resumeHint.setVisible(false);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.scene.pause();
      this.showPauseOverlay();
      console.log('Game Paused - Move Counter:', this.moveCounter);
    } else {
      // 继续游戏
      this.hidePauseOverlay();
      this.scene.resume();
      console.log('Game Resumed - Move Counter:', this.moveCounter);
    }
  }

  showPauseOverlay() {
    this.pauseOverlay.setVisible(true);
    this.pausedText.setVisible(true);
    this.resumeHint.setVisible(true);
  }

  hidePauseOverlay() {
    this.pauseOverlay.setVisible(false);
    this.pausedText.setVisible(false);
    this.resumeHint.setVisible(false);
  }

  update(time, delta) {
    // 移动玩家方块（循环移动）
    this.player.x += this.moveSpeed;
    this.moveCounter++;

    // 边界检测，循环回到左侧
    if (this.player.x > 850) {
      this.player.x = -50;
    }

    // 更新状态文本
    this.statusText.setText(
      `Move Counter: ${this.moveCounter}\n` +
      `Position: ${Math.floor(this.player.x)}\n` +
      `Press Arrow Keys to Pause/Resume`
    );
  }
}

// 创建暂停控制场景（用于在暂停时处理输入）
class PauseControlScene extends Phaser.Scene {
  constructor() {
    super('PauseControlScene');
  }

  create() {
    // 监听方向键以恢复游戏
    this.input.keyboard.on('keydown-UP', () => this.resumeGame());
    this.input.keyboard.on('keydown-DOWN', () => this.resumeGame());
    this.input.keyboard.on('keydown-LEFT', () => this.resumeGame());
    this.input.keyboard.on('keydown-RIGHT', () => this.resumeGame());

    // 监听游戏场景的暂停事件
    this.events.on('wake', () => {
      console.log('Pause control active');
    });
  }

  resumeGame() {
    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.isPaused) {
      gameScene.togglePause();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, PauseControlScene],
  input: {
    keyboard: true
  }
};

// 启动游戏
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const gameScene = game.scene.getScene('GameScene');
  if (gameScene) {
    return {
      isPaused: gameScene.isPaused,
      moveCounter: gameScene.moveCounter,
      playerX: Math.floor(gameScene.player.x)
    };
  }
  return null;
};