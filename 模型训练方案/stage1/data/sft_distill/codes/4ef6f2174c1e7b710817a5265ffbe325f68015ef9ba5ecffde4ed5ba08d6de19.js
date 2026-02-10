// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.buttonState = 'idle'; // 按钮状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);
    
    // 按钮尺寸和位置
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    // 创建按钮图形
    this.buttonGraphics = this.add.graphics();
    this.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 0x808080);
    
    // 创建按钮文本
    const buttonText = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    buttonText.setOrigin(0.5, 0.5);
    
    // 创建标题
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5, 0.5);
    
    // 设置交互区域
    const interactiveZone = this.add.zone(
      width / 2,
      height / 2,
      buttonWidth,
      buttonHeight
    ).setOrigin(0.5, 0.5);
    interactiveZone.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停效果
    interactiveZone.on('pointerover', () => {
      this.buttonState = 'hover';
      this.buttonGraphics.clear();
      this.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 0x999999);
    });
    
    interactiveZone.on('pointerout', () => {
      this.buttonState = 'idle';
      this.buttonGraphics.clear();
      this.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 0x808080);
    });
    
    // 点击事件 - 切换到游戏场景
    interactiveZone.on('pointerdown', () => {
      this.buttonState = 'clicked';
      this.buttonGraphics.clear();
      this.drawButton(buttonX, buttonY, buttonWidth, buttonHeight, 0x606060);
      
      // 延迟切换场景，显示点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });
    
    // 添加状态信息（用于验证）
    const stateText = this.add.text(10, 10, 'Scene: Menu | State: idle', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    
    // 更新状态显示
    this.events.on('update', () => {
      stateText.setText(`Scene: Menu | State: ${this.buttonState}`);
    });
  }
  
  drawButton(x, y, width, height, color) {
    this.buttonGraphics.fillStyle(color, 1);
    this.buttonGraphics.fillRoundedRect(x, y, width, height, 10);
    
    // 添加边框
    this.buttonGraphics.lineStyle(2, 0xffffff, 0.5);
    this.buttonGraphics.strokeRoundedRect(x, y, width, height, 10);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建游戏标题
    const title = this.add.text(width / 2, 80, '游戏场景', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5, 0.5);
    
    // 创建状态面板
    const panelX = width / 2 - 150;
    const panelY = height / 2 - 100;
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x16213e, 1);
    panelGraphics.fillRoundedRect(panelX, panelY, 300, 200, 10);
    panelGraphics.lineStyle(2, 0x0f3460, 1);
    panelGraphics.strokeRoundedRect(panelX, panelY, 300, 200, 10);
    
    // 创建状态文本
    this.scoreText = this.add.text(width / 2, height / 2 - 60, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#e94560',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(0.5, 0.5);
    
    this.levelText = this.add.text(width / 2, height / 2 - 20, `等级: ${this.level}`, {
      fontSize: '20px',
      color: '#0f3460',
      fontFamily: 'Arial'
    });
    this.levelText.setOrigin(0.5, 0.5);
    
    this.healthText = this.add.text(width / 2, height / 2 + 20, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#00d9ff',
      fontFamily: 'Arial'
    });
    this.healthText.setOrigin(0.5, 0.5);
    
    this.timeText = this.add.text(width / 2, height / 2 + 60, `时间: 0s`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.timeText.setOrigin(0.5, 0.5);
    
    // 创建返回按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width / 2 - backButtonWidth / 2;
    const backButtonY = height - 100;
    
    this.backButtonGraphics = this.add.graphics();
    this.drawBackButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 0x808080);
    
    const backButtonText = this.add.text(width / 2, height - 75, '返回菜单', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    backButtonText.setOrigin(0.5, 0.5);
    
    // 返回按钮交互
    const backZone = this.add.zone(
      width / 2,
      height - 75,
      backButtonWidth,
      backButtonHeight
    ).setOrigin(0.5, 0.5);
    backZone.setInteractive({ useHandCursor: true });
    
    backZone.on('pointerover', () => {
      this.backButtonGraphics.clear();
      this.drawBackButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 0x999999);
    });
    
    backZone.on('pointerout', () => {
      this.backButtonGraphics.clear();
      this.drawBackButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 0x808080);
    });
    
    backZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 模拟游戏逻辑 - 定时增加分数和时间
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateGameState,
      callbackScope: this,
      loop: true
    });
    
    // 顶部状态栏（用于验证）
    this.debugText = this.add.text(10, 10, this.getDebugInfo(), {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
  }
  
  updateGameState() {
    this.gameTime++;
    this.score += 10;
    
    // 每10秒升级
    if (this.gameTime % 10 === 0) {
      this.level++;
    }
    
    // 模拟生命值变化（使用确定性计算）
    this.health = Math.max(0, 100 - Math.floor(this.gameTime / 5));
    
    // 更新显示
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
    this.healthText.setText(`生命值: ${this.health}`);
    this.timeText.setText(`时间: ${this.gameTime}s`);
    this.debugText.setText(this.getDebugInfo());
  }
  
  getDebugInfo() {
    return `Scene: Game | Score: ${this.score} | Level: ${this.level} | HP: ${this.health} | Time: ${this.gameTime}s`;
  }
  
  drawBackButton(x, y, width, height, color) {
    this.backButtonGraphics.fillStyle(color, 1);
    this.backButtonGraphics.fillRoundedRect(x, y, width, height, 10);
    this.backButtonGraphics.lineStyle(2, 0xffffff, 0.5);
    this.backButtonGraphics.strokeRoundedRect(x, y, width, height, 10);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene]
};

// 创建游戏实例
new Phaser.Game(config);