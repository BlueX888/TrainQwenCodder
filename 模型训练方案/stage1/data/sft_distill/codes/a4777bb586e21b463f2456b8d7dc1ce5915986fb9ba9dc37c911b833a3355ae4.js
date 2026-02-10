// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.menuState = 'idle'; // 状态信号：idle, hover, clicked
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建按钮容器
    const buttonWidth = 300;
    const buttonHeight = 80;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    // 绘制按钮背景（粉色）
    const button = this.add.graphics();
    button.fillStyle(0xff69b4, 1); // 粉色
    button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
    
    // 添加按钮边框
    button.lineStyle(4, 0xff1493, 1);
    button.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
    
    // 添加按钮文字
    const buttonText = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5, 0.5);
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, 'Phaser3 游戏', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff69b4',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5, 0.5);
    
    // 添加状态指示器
    this.stateText = this.add.text(width / 2, height - 50, 'State: idle', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    this.stateText.setOrigin(0.5, 0.5);
    
    // 创建交互区域
    const interactiveZone = this.add.zone(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );
    interactiveZone.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停效果
    interactiveZone.on('pointerover', () => {
      this.menuState = 'hover';
      this.stateText.setText('State: hover');
      button.clear();
      button.fillStyle(0xff1493, 1); // 深粉色
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
      button.lineStyle(4, 0xff69b4, 1);
      button.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
    });
    
    // 鼠标移出效果
    interactiveZone.on('pointerout', () => {
      this.menuState = 'idle';
      this.stateText.setText('State: idle');
      button.clear();
      button.fillStyle(0xff69b4, 1);
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
      button.lineStyle(4, 0xff1493, 1);
      button.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 16);
    });
    
    // 点击事件
    interactiveZone.on('pointerdown', () => {
      this.menuState = 'clicked';
      this.stateText.setText('State: clicked');
      
      // 按钮按下效果
      button.clear();
      button.fillStyle(0xc71585, 1); // 更深的粉色
      button.fillRoundedRect(buttonX + 2, buttonY + 2, buttonWidth, buttonHeight, 16);
      
      // 延迟切换场景，显示点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });
  }

  update() {
    // MenuScene 不需要每帧更新逻辑
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 状态信号：分数
    this.level = 1; // 状态信号：关卡
    this.health = 100; // 状态信号：生命值
    this.gameState = 'playing'; // 状态信号：playing, paused, gameover
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);
    
    // 添加游戏标题
    const gameTitle = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    gameTitle.setOrigin(0.5, 0.5);
    
    // 创建状态显示面板
    const panelWidth = 400;
    const panelHeight = 200;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x16213e, 0.9);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    panel.lineStyle(3, 0xff69b4, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 12);
    
    // 状态文本
    this.scoreText = this.add.text(width / 2, height / 2 - 50, `分数: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.scoreText.setOrigin(0.5, 0.5);
    
    this.levelText = this.add.text(width / 2, height / 2, `关卡: ${this.level}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.levelText.setOrigin(0.5, 0.5);
    
    this.healthText = this.add.text(width / 2, height / 2 + 50, `生命值: ${this.health}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.healthText.setOrigin(0.5, 0.5);
    
    // 返回菜单按钮
    const backButtonWidth = 200;
    const backButtonHeight = 50;
    const backButtonX = width / 2 - backButtonWidth / 2;
    const backButtonY = height - 100;
    
    const backButton = this.add.graphics();
    backButton.fillStyle(0xff69b4, 1);
    backButton.fillRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
    
    const backButtonText = this.add.text(width / 2, backButtonY + backButtonHeight / 2, '返回菜单', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    backButtonText.setOrigin(0.5, 0.5);
    
    const backZone = this.add.zone(
      backButtonX + backButtonWidth / 2,
      backButtonY + backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight
    );
    backZone.setInteractive({ useHandCursor: true });
    
    backZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 模拟游戏逻辑：每秒增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameState === 'playing') {
          this.score += 10;
          this.scoreText.setText(`分数: ${this.score}`);
          
          // 每100分升级
          if (this.score % 100 === 0 && this.score > 0) {
            this.level++;
            this.levelText.setText(`关卡: ${this.level}`);
          }
        }
      },
      loop: true
    });
    
    // 添加键盘控制提示
    const hint = this.add.text(width / 2, height - 30, '游戏运行中...', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5, 0.5);
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // 场景数组，MenuScene 为默认启动场景
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);