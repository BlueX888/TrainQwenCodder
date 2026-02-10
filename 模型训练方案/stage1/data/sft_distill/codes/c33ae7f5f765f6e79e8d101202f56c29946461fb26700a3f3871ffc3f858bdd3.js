// 全局信号记录
window.__signals__ = {
  gameState: 'menu',
  pauseCount: 0,
  resumeCount: 0,
  restartCount: 0,
  backToMenuCount: 0,
  score: 0,
  actions: []
};

// 主菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    window.__signals__.gameState = 'menu';
    window.__signals__.actions.push({ action: 'enter_menu', time: Date.now() });

    // 背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 150, 'PAUSE MENU DEMO', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 说明文字
    const instruction = this.add.text(400, 250, 'Right-click during game to pause', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    instruction.setOrigin(0.5);

    // 开始按钮
    const startButton = this.createButton(400, 350, 'START GAME', 0x16213e);
    startButton.on('pointerdown', () => {
      window.__signals__.actions.push({ action: 'start_game', time: Date.now() });
      this.scene.start('GameScene');
    });

    // 版本信息
    const info = this.add.text(400, 550, 'Score: ' + window.__signals__.score, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    info.setOrigin(0.5);
  }

  createButton(x, y, text, color) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-100, -25, 200, 50, 10);
    bg.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    button.add([bg, label]);

    // 悬停效果
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x222222, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 10);
    });

    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-100, -25, 200, 50, 10);
    });

    return bg;
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.pauseMenu = null;
    this.player = null;
    this.enemies = [];
    this.scoreText = null;
  }

  create() {
    window.__signals__.gameState = 'playing';
    window.__signals__.actions.push({ action: 'game_started', time: Date.now() });

    // 背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0f3460, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建玩家
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(0, 0, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 500, 'player');

    // 创建敌人
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(-15, -15, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    for (let i = 0; i < 5; i++) {
      const enemy = this.add.sprite(
        100 + i * 150,
        100 + Math.sin(i) * 50,
        'enemy'
      );
      enemy.velocityY = 1 + Math.random() * 2;
      this.enemies.push(enemy);
    }

    // 分数显示
    this.scoreText = this.add.text(20, 20, 'Score: ' + window.__signals__.score, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // 提示文字
    const hint = this.add.text(400, 550, 'Right-click to pause', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);

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
  }

  update(time, delta) {
    if (this.isPaused) return;

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.x = Math.max(20, this.player.x - 5);
    } else if (this.cursors.right.isDown) {
      this.player.x = Math.min(780, this.player.x + 5);
    }

    if (this.cursors.up.isDown) {
      this.player.y = Math.max(20, this.player.y - 5);
    } else if (this.cursors.down.isDown) {
      this.player.y = Math.min(580, this.player.y + 5);
    }

    // 敌人移动
    this.enemies.forEach((enemy, index) => {
      enemy.y += enemy.velocityY;
      
      if (enemy.y > 620) {
        enemy.y = -20;
        enemy.x = 100 + index * 150 + (Math.random() - 0.5) * 100;
        window.__signals__.score += 10;
        this.scoreText.setText('Score: ' + window.__signals__.score);
      }

      // 简单碰撞检测
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (dist < 35) {
        window.__signals__.score = Math.max(0, window.__signals__.score - 5);
        this.scoreText.setText('Score: ' + window.__signals__.score);
        enemy.y = -20;
      }
    });
  }

  showPauseMenu() {
    this.isPaused = true;
    window.__signals__.gameState = 'paused';
    window.__signals__.pauseCount++;
    window.__signals__.actions.push({ 
      action: 'pause', 
      time: Date.now(),
      score: window.__signals__.score 
    });

    // 创建暂停菜单容器
    this.pauseMenu = this.add.container(0, 0);
    this.pauseMenu.setDepth(100);

    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    this.pauseMenu.add(overlay);

    // 菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x16213e, 1);
    menuBg.lineStyle(4, 0x00ff00, 1);
    menuBg.fillRoundedRect(250, 150, 300, 300, 15);
    menuBg.strokeRoundedRect(250, 150, 300, 300, 15);
    this.pauseMenu.add(menuBg);

    // 标题
    const title = this.add.text(400, 200, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.pauseMenu.add(title);

    // 分数显示
    const scoreDisplay = this.add.text(400, 250, 'Score: ' + window.__signals__.score, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    scoreDisplay.setOrigin(0.5);
    this.pauseMenu.add(scoreDisplay);

    // 继续按钮
    const resumeBtn = this.createMenuButton(400, 310, 'CONTINUE', 0x0f3460);
    resumeBtn.on('pointerdown', () => {
      this.resumeGame();
    });
    this.pauseMenu.add(resumeBtn);

    // 重新开始按钮
    const restartBtn = this.createMenuButton(400, 370, 'RESTART', 0x533483);
    restartBtn.on('pointerdown', () => {
      this.restartGame();
    });
    this.pauseMenu.add(restartBtn);

    // 返回主菜单按钮
    const menuBtn = this.createMenuButton(400, 430, 'MAIN MENU', 0x8b0000);
    menuBtn.on('pointerdown', () => {
      this.backToMenu();
    });
    this.pauseMenu.add(menuBtn);
  }

  createMenuButton(x, y, text, color) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-100, -20, 200, 40, 8);
    bg.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    container.add([bg, label]);

    // 悬停效果
    bg.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x333333, 1);
      bg.fillRoundedRect(-100, -20, 200, 40, 8);
      label.setScale(1.1);
    });

    bg.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-100, -20, 200, 40, 8);
      label.setScale(1);
    });

    return container;
  }

  resumeGame() {
    window.__signals__.gameState = 'playing';
    window.__signals__.resumeCount++;
    window.__signals__.actions.push({ 
      action: 'resume', 
      time: Date.now() 
    });

    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }
    this.isPaused = false;
  }

  restartGame() {
    window.__signals__.gameState = 'restarting';
    window.__signals__.restartCount++;
    window.__signals__.score = 0;
    window.__signals__.actions.push({ 
      action: 'restart', 
      time: Date.now() 
    });

    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }
    this.isPaused = false;
    this.scene.restart();
  }

  backToMenu() {
    window.__signals__.gameState = 'menu';
    window.__signals__.backToMenuCount++;
    window.__signals__.actions.push({ 
      action: 'back_to_menu', 
      time: Date.now(),
      finalScore: window.__signals__.score 
    });

    if (this.pauseMenu) {
      this.pauseMenu.destroy();
      this.pauseMenu = null;
    }
    this.isPaused = false;
    this.scene.start('MenuScene');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene],
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 输出信号到控制台
setInterval(() => {
  console.log('Game Signals:', JSON.stringify(window.__signals__, null, 2));
}, 5000);