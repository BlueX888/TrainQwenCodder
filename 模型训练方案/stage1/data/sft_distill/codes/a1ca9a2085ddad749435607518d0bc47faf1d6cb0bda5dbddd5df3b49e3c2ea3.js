// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
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

    // 提示文本
    const hint = this.add.text(400, 350, 'Press ENTER to Start', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    hint.setOrigin(0.5);

    // 说明文本
    const instructions = this.add.text(400, 450, 'Use Arrow Keys to move\nPress ESC to pause', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // 监听回车键
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（使用 Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.playerSpeed = 200;

    // 创建目标物体
    const targetGraphics = this.add.graphics();
    targetGraphics.fillStyle(0xffff00, 1);
    targetGraphics.fillRect(0, 0, 20, 20);
    targetGraphics.generateTexture('target', 20, 20);
    targetGraphics.destroy();

    this.target = this.add.sprite(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550),
      'target'
    );

    // 分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态文本
    this.statusText = this.add.text(400, 16, 'Playing', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5, 0);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // ESC键暂停
    this.input.keyboard.on('keydown-ESC', () => {
      if (!this.isPaused) {
        this.pauseGame();
      }
    });

    // 碰撞检测
    this.physics.add.overlap(this.player, this.target, this.collectTarget, null, this);
  }

  update(time, delta) {
    if (this.isPaused) return;

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

    this.player.x += velocityX * delta / 1000;
    this.player.y += velocityY * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);
  }

  collectTarget() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    
    // 重新放置目标
    this.target.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );
  }

  pauseGame() {
    this.isPaused = true;
    this.statusText.setText('Paused');
    this.statusText.setColor('#ff0000');
    this.scene.pause();
    this.scene.launch('PauseMenuScene', { callingScene: this });
  }

  resumeGame() {
    this.isPaused = false;
    this.statusText.setText('Playing');
    this.statusText.setColor('#00ff00');
    this.scene.resume();
  }

  restartGame() {
    this.score = 0;
    this.scene.restart();
  }
}

// 暂停菜单场景
class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
    this.selectedIndex = 0;
    this.menuOptions = ['Continue', 'Restart', 'Main Menu'];
  }

  init(data) {
    this.callingScene = data.callingScene;
  }

  create() {
    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);

    // 菜单容器
    const menuContainer = this.add.container(400, 250);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2c3e50, 1);
    menuBg.fillRoundedRect(-200, -100, 400, 250, 10);
    menuBg.lineStyle(3, 0xffffff, 1);
    menuBg.strokeRoundedRect(-200, -100, 400, 250, 10);
    menuContainer.add(menuBg);

    // 标题
    const title = this.add.text(0, -70, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    menuContainer.add(title);

    // 菜单选项
    this.menuTexts = [];
    this.menuOptions.forEach((option, index) => {
      const text = this.add.text(0, -10 + index * 50, option, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      text.setOrigin(0.5);
      menuContainer.add(text);
      this.menuTexts.push(text);
    });

    // 选择指示器
    this.selector = this.add.graphics();
    this.selector.fillStyle(0x00ff00, 0.3);
    this.selector.fillRoundedRect(-150, -30, 300, 40, 5);
    menuContainer.add(this.selector);

    this.updateSelection();

    // 键盘输入
    this.input.keyboard.on('keydown-UP', () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
      this.updateSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.menuOptions.length;
      this.updateSelection();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.selectOption();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.continueGame();
    });

    // 提示文本
    const hint = this.add.text(400, 520, 'Use ↑↓ to select, ENTER to confirm, ESC to continue', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);
  }

  updateSelection() {
    // 更新选择器位置
    this.selector.clear();
    this.selector.fillStyle(0x00ff00, 0.3);
    this.selector.fillRoundedRect(-150, -30 + this.selectedIndex * 50, 300, 40, 5);

    // 更新文本颜色
    this.menuTexts.forEach((text, index) => {
      if (index === this.selectedIndex) {
        text.setColor('#00ff00');
        text.setScale(1.1);
      } else {
        text.setColor('#ffffff');
        text.setScale(1);
      }
    });
  }

  selectOption() {
    switch (this.selectedIndex) {
      case 0: // Continue
        this.continueGame();
        break;
      case 1: // Restart
        this.restartGame();
        break;
      case 2: // Main Menu
        this.returnToMainMenu();
        break;
    }
  }

  continueGame() {
    this.callingScene.resumeGame();
    this.scene.stop();
  }

  restartGame() {
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  returnToMainMenu() {
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
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MainMenuScene, GameScene, PauseMenuScene]
};

new Phaser.Game(config);