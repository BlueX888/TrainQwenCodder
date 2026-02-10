// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.menuState = 'idle'; // 状态信号：idle, hover, clicked
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
    
    // 创建青色按钮（使用 Graphics）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    const button = this.add.graphics();
    button.fillStyle(0x00ffff, 1); // 青色
    button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    
    // 添加按钮文本
    const buttonText = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 创建交互区域
    const interactiveZone = this.add.zone(
      width / 2, 
      height / 2, 
      buttonWidth, 
      buttonHeight
    ).setInteractive();
    
    // 鼠标悬停效果
    interactiveZone.on('pointerover', () => {
      this.menuState = 'hover';
      button.clear();
      button.fillStyle(0x00cccc, 1); // 悬停时变暗
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    interactiveZone.on('pointerout', () => {
      this.menuState = 'idle';
      button.clear();
      button.fillStyle(0x00ffff, 1); // 恢复原色
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    // 点击事件 - 切换到游戏场景
    interactiveZone.on('pointerdown', () => {
      this.menuState = 'clicked';
      
      // 点击效果
      button.clear();
      button.fillStyle(0x008888, 1);
      button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
      
      // 延迟切换场景，显示点击效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });
    
    // 添加提示文本
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 状态信号：分数
    this.level = 1; // 状态信号：关卡
    this.gameState = 'playing'; // 状态信号：playing, paused
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f1e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 显示游戏标题
    const title = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 显示状态信息
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.levelText = this.add.text(20, 50, `关卡: ${this.level}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.stateText = this.add.text(20, 80, `状态: ${this.gameState}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    // 创建一个可交互的游戏对象（使用 Graphics 绘制方块）
    const player = this.add.graphics();
    player.fillStyle(0xff0000, 1);
    player.fillRect(width / 2 - 25, height / 2 - 25, 50, 50);
    
    const playerText = this.add.text(width / 2, height / 2, '玩家', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    playerText.setOrigin(0.5);
    
    // 创建返回菜单按钮
    const backButtonWidth = 120;
    const backButtonHeight = 40;
    const backButtonX = width - backButtonWidth - 20;
    const backButtonY = 20;
    
    const backButton = this.add.graphics();
    backButton.fillStyle(0x00ffff, 1);
    backButton.fillRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
    
    const backButtonText = this.add.text(
      backButtonX + backButtonWidth / 2, 
      backButtonY + backButtonHeight / 2, 
      '返回菜单', 
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#000000',
        fontStyle: 'bold'
      }
    );
    backButtonText.setOrigin(0.5);
    
    // 返回按钮交互
    const backZone = this.add.zone(
      backButtonX + backButtonWidth / 2,
      backButtonY + backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight
    ).setInteractive();
    
    backZone.on('pointerover', () => {
      backButton.clear();
      backButton.fillStyle(0x00cccc, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
    });
    
    backZone.on('pointerout', () => {
      backButton.clear();
      backButton.fillStyle(0x00ffff, 1);
      backButton.fillRoundedRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight, 8);
    });
    
    backZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 点击屏幕增加分数（演示游戏交互）
    this.input.on('pointerdown', (pointer) => {
      // 避免点击返回按钮时增加分数
      if (pointer.x < backButtonX || pointer.x > backButtonX + backButtonWidth ||
          pointer.y < backButtonY || pointer.y > backButtonY + backButtonHeight) {
        this.score += 10;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 每 100 分升级
        if (this.score % 100 === 0 && this.score > 0) {
          this.level++;
          this.levelText.setText(`关卡: ${this.level}`);
        }
      }
    });
    
    // 添加提示信息
    const hint = this.add.text(width / 2, height - 50, '点击屏幕增加分数', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
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
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene 为默认启动场景
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);