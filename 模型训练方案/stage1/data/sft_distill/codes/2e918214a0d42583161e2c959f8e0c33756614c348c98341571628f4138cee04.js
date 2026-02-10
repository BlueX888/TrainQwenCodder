// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 菜单场景无需预加载资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, 'Phaser3 游戏', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建粉色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 添加按钮文字
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '28px',
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
    ).setInteractive({ useHandCursor: true });

    // 添加悬停效果
    buttonZone.on('pointerover', () => {
      graphics.clear();
      graphics.fillStyle(0xff1493, 1); // 深粉色
      graphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setScale(1.1);
    });

    buttonZone.on('pointerout', () => {
      graphics.clear();
      graphics.fillStyle(0xff69b4, 1); // 粉色
      graphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setScale(1);
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // 添加提示文字
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#cccccc'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.gameState = {
      level: 1,
      score: 0,
      health: 100,
      isPlaying: true
    };
  }

  preload() {
    // 游戏场景无需预加载资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示游戏标题
    const gameTitle = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    gameTitle.setOrigin(0.5);

    // 显示状态信息
    this.statusText = this.add.text(20, 100, '', {
      fontSize: '20px',
      color: '#00ff00',
      lineSpacing: 10
    });
    this.updateStatusText();

    // 创建玩家角色（使用 Graphics 绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(width / 2, height / 2, 20);
    
    // 添加玩家标签
    const playerLabel = this.add.text(width / 2, height / 2, 'P', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });
    playerLabel.setOrigin(0.5);

    // 创建返回菜单按钮
    this.createBackButton();

    // 创建计分区域（点击增加分数）
    const scoreZone = this.add.zone(width / 2, height * 0.7, 300, 100)
      .setInteractive({ useHandCursor: true });
    
    const scoreGraphics = this.add.graphics();
    scoreGraphics.fillStyle(0x4169e1, 1);
    scoreGraphics.fillRoundedRect(width / 2 - 150, height * 0.7 - 50, 300, 100, 10);
    
    const scoreButtonText = this.add.text(width / 2, height * 0.7, '点击得分', {
      fontSize: '24px',
      color: '#ffffff'
    });
    scoreButtonText.setOrigin(0.5);

    scoreZone.on('pointerdown', () => {
      this.gameState.score += 10;
      if (this.gameState.score % 50 === 0) {
        this.gameState.level++;
      }
      this.updateStatusText();
    });

    // 添加游戏说明
    const instruction = this.add.text(width / 2, height - 50, 
      '点击蓝色区域增加分数 | 每50分升级', {
      fontSize: '16px',
      color: '#cccccc'
    });
    instruction.setOrigin(0.5);
  }

  createBackButton() {
    const { width } = this.cameras.main;
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonX = width - 80;
    const buttonY = 30;

    const backGraphics = this.add.graphics();
    backGraphics.fillStyle(0xff4444, 1);
    backGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      5
    );

    const backText = this.add.text(buttonX, buttonY, '返回菜单', {
      fontSize: '18px',
      color: '#ffffff'
    });
    backText.setOrigin(0.5);

    const backZone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true });

    backZone.on('pointerdown', () => {
      // 重置游戏状态
      this.gameState = {
        level: 1,
        score: 0,
        health: 100,
        isPlaying: true
      };
      this.scene.start('MenuScene');
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `关卡: ${this.gameState.level}`,
      `分数: ${this.gameState.score}`,
      `生命值: ${this.gameState.health}`,
      `状态: ${this.gameState.isPlaying ? '进行中' : '暂停'}`
    ]);
  }

  update(time, delta) {
    // 游戏更新逻辑（当前为演示，无需复杂更新）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#16213e',
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene 为默认启动场景
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);