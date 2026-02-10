// 全局信号记录
window.__signals__ = {
  currentScene: 'MenuScene',
  buttonClicked: false,
  sceneTransitions: [],
  gameStartTime: null,
  logs: []
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 不需要加载外部资源
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'MenuScene.preload',
      scene: 'MenuScene'
    });
  }

  create() {
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'MenuScene.create',
      scene: 'MenuScene'
    });

    const { width, height } = this.cameras.main;

    // 添加标题
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建黄色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xffff00, 1); // 黄色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
      color: '#000000',
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
      buttonGraphics.fillStyle(0xffdd00, 1); // 稍微暗一点的黄色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      window.__signals__.logs.push({
        timestamp: Date.now(),
        event: 'button.hover',
        scene: 'MenuScene'
      });
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffff00, 1);
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    // 点击事件
    buttonZone.on('pointerdown', () => {
      window.__signals__.buttonClicked = true;
      window.__signals__.sceneTransitions.push({
        from: 'MenuScene',
        to: 'GameScene',
        timestamp: Date.now()
      });
      window.__signals__.logs.push({
        timestamp: Date.now(),
        event: 'button.click',
        scene: 'MenuScene',
        action: 'transition_to_GameScene'
      });

      // 切换到游戏场景
      this.scene.start('GameScene');
    });

    // 添加提示文本
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.health = 100;
    this.level = 1;
  }

  preload() {
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'GameScene.preload',
      scene: 'GameScene'
    });
  }

  create() {
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.gameStartTime = Date.now();
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'GameScene.create',
      scene: 'GameScene'
    });

    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建玩家（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(width / 2 - 25, height / 2 - 25, 50, 50);

    // 状态显示
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.healthText = this.add.text(20, 50, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.levelText = this.add.text(20, 80, `关卡: ${this.level}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 40;
    const backButtonX = width - 100;
    const backButtonY = 30;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xff6b6b, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      5
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '18px',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setInteractive();

    backButtonZone.on('pointerdown', () => {
      window.__signals__.sceneTransitions.push({
        from: 'GameScene',
        to: 'MenuScene',
        timestamp: Date.now()
      });
      window.__signals__.logs.push({
        timestamp: Date.now(),
        event: 'backButton.click',
        scene: 'GameScene',
        action: 'transition_to_MenuScene'
      });
      this.scene.start('MenuScene');
    });

    // 点击屏幕增加分数
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y > 120 && pointer.y < height - 50) {
        this.score += 10;
        this.updateStatus();
        
        window.__signals__.logs.push({
          timestamp: Date.now(),
          event: 'screen.click',
          scene: 'GameScene',
          score: this.score,
          position: { x: pointer.x, y: pointer.y }
        });

        // 显示点击效果
        const clickEffect = this.add.graphics();
        clickEffect.fillStyle(0xffffff, 0.8);
        clickEffect.fillCircle(pointer.x, pointer.y, 10);
        
        this.tweens.add({
          targets: clickEffect,
          alpha: 0,
          scale: 2,
          duration: 500,
          onComplete: () => clickEffect.destroy()
        });
      }
    });

    // 提示文本
    const hint = this.add.text(width / 2, height - 30, '点击屏幕增加分数', {
      fontSize: '16px',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);

    // 同步状态到全局信号
    this.updateStatus();
  }

  updateStatus() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.healthText.setText(`生命值: ${this.health}`);
    this.levelText.setText(`关卡: ${this.level}`);

    // 更新全局信号
    window.__signals__.gameState = {
      score: this.score,
      health: this.health,
      level: this.level,
      timestamp: Date.now()
    };
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene 为初始场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化信号
window.__signals__.logs.push({
  timestamp: Date.now(),
  event: 'game.init',
  config: {
    width: config.width,
    height: config.height,
    scenes: ['MenuScene', 'GameScene']
  }
});

// 导出游戏实例供测试使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, MenuScene, GameScene };
}