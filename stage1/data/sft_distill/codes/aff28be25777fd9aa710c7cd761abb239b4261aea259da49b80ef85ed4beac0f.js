// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {}

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height / 3, 'MAIN MENU', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏按钮
    const startButton = this.createButton(
      width / 2,
      height / 2,
      'START GAME',
      () => {
        this.scene.start('GameScene');
      }
    );

    // 提示文字
    const hint = this.add.text(width / 2, height * 0.8, 'Press SPACE to pause during game', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x4a4a6a, 1);
    bg.fillRoundedRect(-100, -25, 200, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(200, 50);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6a6a8a, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 8);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a4a6a, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 8);
    });

    button.on('pointerdown', callback);

    return button;
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
    this.gameTime = 0;
  }

  preload() {}

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // 创建一个简单的玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-20, -20, 40, 40);
    this.player.x = width / 2;
    this.player.y = height / 2;

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 游戏时间显示
    this.timeText = this.add.text(20, 50, 'Time: 0s', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 暂停菜单容器（初始不可见）
    this.pauseMenu = null;

    // 自动增加分数（模拟游戏进行）
    this.scoreTimer = this.time.addEvent({
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

  update(time, delta) {
    if (this.isPaused) {
      return; // 暂停时不更新游戏逻辑
    }

    // 更新游戏时间
    this.gameTime += delta;
    this.timeText.setText('Time: ' + Math.floor(this.gameTime / 1000) + 's');

    // 玩家移动
    const speed = 3;
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

    // 边界检查
    const { width, height } = this.cameras.main;
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, width - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, height - 20);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    const { width, height } = this.cameras.main;

    // 创建暂停菜单容器
    this.pauseMenu = this.add.container(0, 0);
    this.pauseMenu.setDepth(1000);

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    this.pauseMenu.add(overlay);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2d2d44, 1);
    menuBg.lineStyle(4, 0xffffff, 1);
    menuBg.fillRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 16);
    menuBg.strokeRoundedRect(width / 2 - 200, height / 2 - 200, 400, 400, 16);
    this.pauseMenu.add(menuBg);

    // 暂停标题
    const pauseTitle = this.add.text(width / 2, height / 2 - 120, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);
    this.pauseMenu.add(pauseTitle);

    // 当前分数显示
    const currentScore = this.add.text(width / 2, height / 2 - 60, 'Score: ' + this.score, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffcc00'
    });
    currentScore.setOrigin(0.5);
    this.pauseMenu.add(currentScore);

    // 继续按钮
    const resumeBtn = this.createMenuButton(
      width / 2,
      height / 2 + 10,
      'CONTINUE',
      0x4caf50,
      0x66bb6a,
      () => {
        this.togglePause();
      }
    );
    this.pauseMenu.add(resumeBtn);

    // 重新开始按钮
    const restartBtn = this.createMenuButton(
      width / 2,
      height / 2 + 80,
      'RESTART',
      0xff9800,
      0xffb74d,
      () => {
        this.hidePauseMenu();
        this.scene.restart();
      }
    );
    this.pauseMenu.add(restartBtn);

    // 返回主菜单按钮
    const mainMenuBtn = this.createMenuButton(
      width / 2,
      height / 2 + 150,
      'MAIN MENU',
      0xf44336,
      0xe57373,
      () => {
        this.hidePauseMenu();
        this.scene.start('MainMenuScene');
      }
    );
    this.pauseMenu.add(mainMenuBtn);
  }

  hidePauseMenu() {
    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }
  }

  createMenuButton(x, y, text, color, hoverColor, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-120, -25, 240, 50, 8);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(240, 50);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(hoverColor, 1);
      bg.fillRoundedRect(-120, -25, 240, 50, 8);
      label.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-120, -25, 240, 50, 8);
      label.setScale(1);
    });

    button.on('pointerdown', callback);

    return button;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MainMenuScene, GameScene]
};

// 创建游戏实例
new Phaser.Game(config);