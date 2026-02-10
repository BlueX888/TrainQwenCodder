// 全局信号记录
window.__signals__ = {
  currentScene: 'MenuScene',
  sceneTransitions: [],
  buttonClicks: 0,
  gameState: {
    score: 0,
    level: 1,
    health: 100
  }
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景创建
    window.__signals__.currentScene = 'MenuScene';
    window.__signals__.sceneTransitions.push({
      scene: 'MenuScene',
      timestamp: Date.now(),
      action: 'created'
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    const title = this.add.text(400, 150, 'PHASER GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建红色按钮背景
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xff0000, 1);
    buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);

    // 添加按钮边框效果
    buttonGraphics.lineStyle(4, 0xffffff, 0.8);
    buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);

    // 创建按钮文本
    const buttonText = this.add.text(400, 340, '开始游戏', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(400, 340, 300, 80);
    buttonZone.setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcc0000, 1);
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
      buttonGraphics.lineStyle(4, 0xffff00, 1);
      buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);
      buttonText.setScale(1.1);
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xff0000, 1);
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);
      buttonGraphics.lineStyle(4, 0xffffff, 0.8);
      buttonGraphics.strokeRoundedRect(250, 300, 300, 80, 10);
      buttonText.setScale(1);
    });

    // 按钮点击事件
    buttonZone.on('pointerdown', () => {
      // 记录按钮点击
      window.__signals__.buttonClicks++;
      window.__signals__.sceneTransitions.push({
        scene: 'MenuScene',
        timestamp: Date.now(),
        action: 'buttonClicked',
        clickCount: window.__signals__.buttonClicks
      });

      // 按钮按下效果
      buttonText.setScale(0.95);
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x990000, 1);
      buttonGraphics.fillRoundedRect(250, 300, 300, 80, 10);

      // 延迟切换场景，展示按下效果
      this.time.delayedCall(150, () => {
        window.__signals__.sceneTransitions.push({
          scene: 'GameScene',
          timestamp: Date.now(),
          action: 'transitioning'
        });
        this.scene.start('GameScene');
      });
    });

    // 添加提示文本
    const hint = this.add.text(400, 500, '点击红色按钮开始游戏', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);

    console.log('MenuScene created:', JSON.stringify(window.__signals__, null, 2));
  }

  update() {
    // MenuScene 不需要持续更新逻辑
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.scoreText = null;
    this.healthText = null;
    this.levelText = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景创建
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.sceneTransitions.push({
      scene: 'GameScene',
      timestamp: Date.now(),
      action: 'created'
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, 800, 600);

    // 添加网格效果
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x16213e, 0.3);
    for (let x = 0; x < 800; x += 50) {
      grid.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      grid.lineBetween(0, y, 800, y);
    }

    // 创建玩家（使用 Graphics 绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(0, 0, 20);
    playerGraphics.lineStyle(3, 0xffffff, 1);
    playerGraphics.strokeCircle(0, 0, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建 UI 面板
    const uiPanel = this.add.graphics();
    uiPanel.fillStyle(0x000000, 0.7);
    uiPanel.fillRect(10, 10, 250, 120);
    uiPanel.lineStyle(2, 0xffffff, 0.5);
    uiPanel.strokeRect(10, 10, 250, 120);

    // 显示游戏状态
    this.add.text(20, 20, '游戏状态', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(20, 55, `分数: ${window.__signals__.gameState.score}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });

    this.healthText = this.add.text(20, 80, `生命值: ${window.__signals__.gameState.health}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });

    this.levelText = this.add.text(20, 105, `关卡: ${window.__signals__.gameState.level}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ffff'
    });

    // 添加控制说明
    const controls = this.add.text(400, 550, '使用方向键移动 | 按 ESC 返回菜单', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    controls.setOrigin(0.5);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 返回菜单按钮
    const backButton = this.add.graphics();
    backButton.fillStyle(0xff6600, 1);
    backButton.fillRoundedRect(650, 10, 140, 50, 8);
    backButton.lineStyle(2, 0xffffff, 0.8);
    backButton.strokeRoundedRect(650, 10, 140, 50, 8);

    const backText = this.add.text(720, 35, '返回菜单', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    backText.setOrigin(0.5);

    const backZone = this.add.zone(720, 35, 140, 50);
    backZone.setInteractive({ useHandCursor: true });

    backZone.on('pointerdown', () => {
      this.returnToMenu();
    });

    console.log('GameScene created:', JSON.stringify(window.__signals__, null, 2));
  }

  update(time, delta) {
    // 玩家移动
    const speed = 3;
    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
      moved = true;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 移动时增加分数
    if (moved) {
      window.__signals__.gameState.score++;
      this.scoreText.setText(`分数: ${window.__signals__.gameState.score}`);
    }

    // 每1000分升级
    const newLevel = Math.floor(window.__signals__.gameState.score / 1000) + 1;
    if (newLevel !== window.__signals__.gameState.level) {
      window.__signals__.gameState.level = newLevel;
      this.levelText.setText(`关卡: ${window.__signals__.gameState.level}`);
      console.log('Level up!', JSON.stringify(window.__signals__.gameState, null, 2));
    }

    // ESC 键返回菜单
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.returnToMenu();
    }
  }

  returnToMenu() {
    window.__signals__.sceneTransitions.push({
      scene: 'MenuScene',
      timestamp: Date.now(),
      action: 'returning',
      finalGameState: { ...window.__signals__.gameState }
    });
    console.log('Returning to menu:', JSON.stringify(window.__signals__, null, 2));
    this.scene.start('MenuScene');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scene: [MenuScene, GameScene]
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));