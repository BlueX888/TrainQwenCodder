// 全局信号记录
window.__signals__ = {
  events: [],
  currentScene: null,
  clickCount: 0
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 记录场景切换
    window.__signals__.currentScene = 'MenuScene';
    window.__signals__.events.push({
      type: 'sceneStart',
      scene: 'MenuScene',
      timestamp: Date.now()
    });

    // 设置背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 添加标题文字
    const titleText = this.add.text(400, 150, 'PHASER GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建开始按钮背景（红色矩形）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = 400;
    const buttonY = 300;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xff0000, 1);
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文字
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setInteractive();

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcc0000, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      this.input.setDefaultCursor('pointer');
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xff0000, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      this.input.setDefaultCursor('default');
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      window.__signals__.clickCount++;
      window.__signals__.events.push({
        type: 'buttonClick',
        button: 'startGame',
        scene: 'MenuScene',
        timestamp: Date.now()
      });

      // 添加点击反馈
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x990000, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );

      // 延迟切换场景，显示点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加提示文字
    const hintText = this.add.text(400, 450, '点击按钮开始游戏', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hintText.setOrigin(0.5);
  }

  update(time, delta) {
    // MenuScene 不需要持续更新逻辑
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 记录场景切换
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.events.push({
      type: 'sceneStart',
      scene: 'GameScene',
      timestamp: Date.now()
    });

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 添加游戏标题
    const titleText = this.add.text(400, 50, 'GAME SCENE', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 显示游戏状态
    this.scoreText = this.add.text(400, 150, `Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 190, `Level: ${this.level}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff'
    });
    this.levelText.setOrigin(0.5);

    // 创建一个简单的游戏元素（可点击的方块）
    const squareSize = 80;
    const squareX = 400;
    const squareY = 300;

    const squareGraphics = this.add.graphics();
    squareGraphics.fillStyle(0x00ff00, 1);
    squareGraphics.fillRect(
      squareX - squareSize / 2,
      squareY - squareSize / 2,
      squareSize,
      squareSize
    );

    const squareZone = this.add.zone(
      squareX,
      squareY,
      squareSize,
      squareSize
    ).setInteractive();

    // 点击方块增加分数
    squareZone.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);

      window.__signals__.clickCount++;
      window.__signals__.events.push({
        type: 'gameClick',
        element: 'square',
        score: this.score,
        timestamp: Date.now()
      });

      // 每 50 分升级
      if (this.score % 50 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
        window.__signals__.events.push({
          type: 'levelUp',
          level: this.level,
          timestamp: Date.now()
        });
      }

      // 点击反馈动画
      this.tweens.add({
        targets: squareGraphics,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true
      });
    });

    // 创建返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = 400;
    const backButtonY = 500;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xff6600, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      8
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setInteractive();

    backButtonZone.on('pointerover', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xcc5200, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
      this.input.setDefaultCursor('pointer');
    });

    backButtonZone.on('pointerout', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xff6600, 1);
      backButtonGraphics.fillRoundedRect(
        backButtonX - backButtonWidth / 2,
        backButtonY - backButtonHeight / 2,
        backButtonWidth,
        backButtonHeight,
        8
      );
      this.input.setDefaultCursor('default');
    });

    backButtonZone.on('pointerdown', () => {
      window.__signals__.clickCount++;
      window.__signals__.events.push({
        type: 'buttonClick',
        button: 'backToMenu',
        scene: 'GameScene',
        finalScore: this.score,
        finalLevel: this.level,
        timestamp: Date.now()
      });

      this.scene.start('MenuScene');
    });

    // 添加游戏提示
    const hintText = this.add.text(400, 400, '点击绿色方块增加分数', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hintText.setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑更新
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
window.__game__ = game;

// 输出初始信号状态
console.log('Game initialized. Signals:', JSON.stringify(window.__signals__, null, 2));