// 主菜单场景
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'GAME TITLE', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#00ff88',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.text(400, 350, 'START GAME', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    startButton.on('pointerover', () => {
      startButton.setColor('#00ff88');
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setColor('#ffffff');
      startButton.setScale(1);
    });

    // 点击开始游戏
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 提示文本
    const hint = this.add.text(400, 500, 'Press SPACE to pause during game', {
      fontSize: '16px',
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
    this.score = 0;
    this.isPaused = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 重置游戏状态
    this.score = 0;
    this.isPaused = false;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一个移动的玩家方块（用于演示游戏运行）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff88, 1);
    playerGraphics.fillRect(-25, -25, 50, 50);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.player.setData('vx', 2);
    this.player.setData('vy', 1.5);

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 提示文本
    this.hintText = this.add.text(400, 550, 'Press SPACE to pause', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    this.hintText.setOrigin(0.5);

    // 添加空格键监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件而不是 isDown 检查，避免重复触发
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 创建暂停菜单容器（初始隐藏）
    this.createPauseMenu();

    // 游戏逻辑：每秒增加分数
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      },
      loop: true
    });
  }

  createPauseMenu() {
    // 半透明遮罩
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.7);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 菜单背景
    this.menuBg = this.add.graphics();
    this.menuBg.fillStyle(0x16213e, 1);
    this.menuBg.fillRoundedRect(250, 150, 300, 300, 10);
    this.menuBg.lineStyle(3, 0x00ff88, 1);
    this.menuBg.strokeRoundedRect(250, 150, 300, 300, 10);
    this.menuBg.setDepth(101);
    this.menuBg.setVisible(false);

    // 暂停标题
    this.pauseTitle = this.add.text(400, 200, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff88',
      fontStyle: 'bold'
    });
    this.pauseTitle.setOrigin(0.5);
    this.pauseTitle.setDepth(102);
    this.pauseTitle.setVisible(false);

    // 菜单选项
    const menuOptions = [
      { text: 'Continue', y: 280, action: () => this.resumeGame() },
      { text: 'Restart', y: 340, action: () => this.restartGame() },
      { text: 'Main Menu', y: 400, action: () => this.returnToMainMenu() }
    ];

    this.menuItems = [];

    menuOptions.forEach((option, index) => {
      const menuItem = this.add.text(400, option.y, option.text, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      menuItem.setOrigin(0.5);
      menuItem.setDepth(102);
      menuItem.setVisible(false);
      menuItem.setInteractive({ useHandCursor: true });

      // 悬停效果
      menuItem.on('pointerover', () => {
        menuItem.setColor('#00ff88');
        menuItem.setScale(1.15);
      });

      menuItem.on('pointerout', () => {
        menuItem.setColor('#ffffff');
        menuItem.setScale(1);
      });

      // 点击事件
      menuItem.on('pointerdown', () => {
        option.action();
      });

      this.menuItems.push(menuItem);
    });
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    this.scene.pause();
    
    // 显示暂停菜单
    this.pauseOverlay.setVisible(true);
    this.menuBg.setVisible(true);
    this.pauseTitle.setVisible(true);
    this.menuItems.forEach(item => item.setVisible(true));

    // 暂停计时器
    this.scoreTimer.paused = true;
  }

  resumeGame() {
    this.isPaused = false;
    
    // 隐藏暂停菜单
    this.pauseOverlay.setVisible(false);
    this.menuBg.setVisible(false);
    this.pauseTitle.setVisible(false);
    this.menuItems.forEach(item => item.setVisible(false));

    // 恢复计时器
    this.scoreTimer.paused = false;
    
    this.scene.resume();
  }

  restartGame() {
    // 重新开始游戏
    this.scene.restart();
  }

  returnToMainMenu() {
    // 返回主菜单
    this.scene.start('MainMenuScene');
  }

  update(time, delta) {
    // 玩家方块移动（演示游戏运行状态）
    if (!this.isPaused && this.player) {
      let vx = this.player.getData('vx');
      let vy = this.player.getData('vy');

      this.player.x += vx;
      this.player.y += vy;

      // 边界反弹
      if (this.player.x <= 25 || this.player.x >= 775) {
        vx *= -1;
        this.player.setData('vx', vx);
      }
      if (this.player.y <= 25 || this.player.y >= 575) {
        vy *= -1;
        this.player.setData('vy', vy);
      }
    }
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
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const gameScene = game.scene.getScene('GameScene');
  if (gameScene && gameScene.scene.isActive()) {
    return {
      score: gameScene.score,
      isPaused: gameScene.isPaused,
      sceneActive: true
    };
  }
  return {
    score: 0,
    isPaused: false,
    sceneActive: false
  };
};