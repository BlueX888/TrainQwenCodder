// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height / 3, 'PAUSE MENU DEMO', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始游戏提示
    const startText = this.add.text(width / 2, height / 2, 'Press ENTER to Start', {
      fontSize: '24px',
      color: '#00ff00'
    });
    startText.setOrigin(0.5);

    // 说明文字
    const instructions = this.add.text(width / 2, height / 2 + 60, 'Press ESC in game to pause', {
      fontSize: '18px',
      color: '#aaaaaa'
    });
    instructions.setOrigin(0.5);

    // 监听回车键开始游戏
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
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // 创建玩家（简单方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(-20, -20, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(width / 2, height / 2, 'player');

    // 分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 游戏提示
    this.hintText = this.add.text(width / 2, height - 40, 'Use Arrow Keys to move | ESC to pause', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 监听ESC键打开暂停菜单
    this.escKey.on('down', () => {
      if (!this.isPaused) {
        this.openPauseMenu();
      }
    });

    // 创建一些装饰性移动物体
    this.obstacles = [];
    for (let i = 0; i < 5; i++) {
      const obstacleGraphics = this.add.graphics();
      obstacleGraphics.fillStyle(0xff6b6b, 1);
      obstacleGraphics.fillCircle(0, 0, 15);
      obstacleGraphics.generateTexture('obstacle' + i, 30, 30);
      obstacleGraphics.destroy();

      const obstacle = this.add.sprite(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 100),
        'obstacle' + i
      );
      obstacle.speedX = Phaser.Math.Between(-100, 100);
      obstacle.speedY = Phaser.Math.Between(-100, 100);
      this.obstacles.push(obstacle);
    }

    // 分数计时器
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.isPaused) return;

    const speed = 200;
    const dt = delta / 1000;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.x -= speed * dt;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed * dt;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed * dt;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed * dt;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, this.cameras.main.width - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, this.cameras.main.height - 20);

    // 移动障碍物
    this.obstacles.forEach(obstacle => {
      obstacle.x += obstacle.speedX * dt;
      obstacle.y += obstacle.speedY * dt;

      // 边界反弹
      if (obstacle.x < 15 || obstacle.x > this.cameras.main.width - 15) {
        obstacle.speedX *= -1;
      }
      if (obstacle.y < 15 || obstacle.y > this.cameras.main.height - 15) {
        obstacle.speedY *= -1;
      }
    });
  }

  openPauseMenu() {
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch('PauseMenuScene', { gameScene: this });
  }

  resumeGame() {
    this.isPaused = false;
    this.scene.resume();
  }

  restartGame() {
    this.isPaused = false;
    this.score = 0;
    this.scene.restart();
  }
}

// 暂停菜单场景
class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super('PauseMenuScene');
    this.selectedIndex = 0;
    this.menuItems = ['Continue', 'Restart', 'Main Menu'];
  }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明背景遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // 暂停菜单容器背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x2d3561, 1);
    menuBg.fillRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 10);
    menuBg.lineStyle(4, 0x4ecca3, 1);
    menuBg.strokeRoundedRect(width / 2 - 200, height / 2 - 150, 400, 300, 10);

    // 暂停标题
    const pauseTitle = this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    pauseTitle.setOrigin(0.5);

    // 创建菜单选项
    this.menuTexts = [];
    const startY = height / 2 - 20;
    const spacing = 60;

    this.menuItems.forEach((item, index) => {
      const text = this.add.text(width / 2, startY + index * spacing, item, {
        fontSize: '28px',
        color: '#ffffff'
      });
      text.setOrigin(0.5);
      this.menuTexts.push(text);
    });

    // 选择指示器
    this.selector = this.add.graphics();
    this.updateSelector();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 防止按键重复触发
    this.canMove = true;
    this.canSelect = true;

    // ESC键快速继续
    this.escKey.on('down', () => {
      if (this.canSelect) {
        this.selectMenuItem(0); // 继续游戏
      }
    });

    // 回车键确认选择
    this.enterKey.on('down', () => {
      if (this.canSelect) {
        this.selectMenuItem(this.selectedIndex);
      }
    });
  }

  update() {
    // 方向键导航
    if (this.canMove) {
      if (this.cursors.up.isDown) {
        this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
        this.updateSelector();
        this.canMove = false;
        this.time.delayedCall(200, () => { this.canMove = true; });
      } else if (this.cursors.down.isDown) {
        this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
        this.updateSelector();
        this.canMove = false;
        this.time.delayedCall(200, () => { this.canMove = true; });
      }
    }
  }

  updateSelector() {
    this.selector.clear();
    this.selector.lineStyle(3, 0x4ecca3, 1);
    
    const selectedText = this.menuTexts[this.selectedIndex];
    const bounds = selectedText.getBounds();
    
    // 绘制选择框
    this.selector.strokeRect(
      bounds.x - 20,
      bounds.y - 5,
      bounds.width + 40,
      bounds.height + 10
    );

    // 更新文字颜色
    this.menuTexts.forEach((text, index) => {
      if (index === this.selectedIndex) {
        text.setColor('#4ecca3');
        text.setScale(1.1);
      } else {
        text.setColor('#ffffff');
        text.setScale(1);
      }
    });
  }

  selectMenuItem(index) {
    this.canSelect = false;

    switch (index) {
      case 0: // Continue
        this.scene.stop();
        this.gameScene.resumeGame();
        break;
      
      case 1: // Restart
        this.scene.stop();
        this.gameScene.restartGame();
        break;
      
      case 2: // Main Menu
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

const game = new Phaser.Game(config);