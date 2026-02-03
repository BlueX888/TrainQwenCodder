// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height / 3, 'PHASER GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始按钮
    this.createButton(width / 2, height / 2, '开始游戏', () => {
      this.scene.start('GameScene');
    });

    // 提示文字
    const hint = this.add.text(width / 2, height * 0.75, '按空格键暂停游戏', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const buttonWidth = 200;
    const buttonHeight = 50;

    // 按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);

    // 按钮文字
    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 交互区域
    const hitArea = new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
    buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x2980b9, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x3498db, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    buttonBg.on('pointerdown', callback);

    return { bg: buttonBg, text: buttonText };
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, width, height);

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });

    // 游戏提示
    this.hintText = this.add.text(width / 2, height / 2, '按空格键暂停', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    this.hintText.setOrigin(0.5);

    // 创建一个简单的移动方块作为游戏内容
    this.createPlayer();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      if (!this.isPaused) {
        this.showPauseMenu();
      }
    });

    // 方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 暂停菜单容器（初始隐藏）
    this.pauseMenuContainer = null;

    // 自动增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isPaused) {
          this.score += 10;
          this.scoreText.setText('Score: ' + this.score);
        }
      },
      loop: true
    });
  }

  createPlayer() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.playerSpeed = 200;
  }

  update(time, delta) {
    if (this.isPaused) return;

    // 玩家移动
    const speed = this.playerSpeed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);
  }

  showPauseMenu() {
    this.isPaused = true;
    this.physics.pause();

    const { width, height } = this.cameras.main;

    // 创建暂停菜单容器
    this.pauseMenuContainer = this.add.container(0, 0);

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    this.pauseMenuContainer.add(overlay);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2c3e50, 1);
    menuBg.fillRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 15);
    menuBg.lineStyle(3, 0x3498db, 1);
    menuBg.strokeRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 15);
    this.pauseMenuContainer.add(menuBg);

    // 暂停标题
    const pauseTitle = this.add.text(width / 2, height / 2 - 120, '游戏暂停', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);
    this.pauseMenuContainer.add(pauseTitle);

    // 当前分数显示
    const currentScore = this.add.text(width / 2, height / 2 - 60, `当前分数: ${this.score}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    currentScore.setOrigin(0.5);
    this.pauseMenuContainer.add(currentScore);

    // 创建三个按钮
    const buttonY = [height / 2, height / 2 + 70, height / 2 + 140];
    const buttonLabels = ['继续游戏', '重新开始', '返回主菜单'];
    const buttonCallbacks = [
      () => this.resumeGame(),
      () => this.restartGame(),
      () => this.returnToMainMenu()
    ];

    buttonLabels.forEach((label, index) => {
      const button = this.createMenuButton(width / 2, buttonY[index], label, buttonCallbacks[index]);
      this.pauseMenuContainer.add(button.bg);
      this.pauseMenuContainer.add(button.text);
    });

    // 将容器置于最上层
    this.pauseMenuContainer.setDepth(1000);
  }

  createMenuButton(x, y, text, callback) {
    const buttonWidth = 250;
    const buttonHeight = 50;

    // 按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x27ae60, 1);
    buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);

    // 按钮文字
    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 交互区域
    const hitArea = new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight);
    buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x229954, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x27ae60, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    buttonBg.on('pointerdown', callback);

    return { bg: buttonBg, text: buttonText };
  }

  resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy();
      this.pauseMenuContainer = null;
    }
  }

  restartGame() {
    this.isPaused = false;
    this.score = 0;
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy();
      this.pauseMenuContainer = null;
    }
    this.scene.restart();
  }

  returnToMainMenu() {
    this.isPaused = false;
    if (this.pauseMenuContainer) {
      this.pauseMenuContainer.destroy();
      this.pauseMenuContainer = null;
    }
    this.scene.start('MainMenuScene');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainMenuScene, GameScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露验证状态
window.getGameState = function() {
  const gameScene = game.scene.getScene('GameScene');
  if (gameScene) {
    return {
      score: gameScene.score,
      isPaused: gameScene.isPaused,
      isActive: gameScene.scene.isActive()
    };
  }
  return { error: 'GameScene not found' };
};