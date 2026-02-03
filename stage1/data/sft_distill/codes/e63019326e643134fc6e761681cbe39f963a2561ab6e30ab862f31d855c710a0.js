// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.currentScene = 'MenuScene'; // 状态信号
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
    
    // 创建绿色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x00ff00, 1);
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    
    // 添加按钮文本
    const buttonText = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5, 0.5);
    
    // 添加标题文本
    const titleText = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);
    
    // 创建交互区域
    const buttonZone = this.add.zone(width / 2, height / 2, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x00cc00, 1); // 深绿色
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x00ff00, 1); // 恢复亮绿色
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      console.log('切换到 GameScene');
      this.scene.start('GameScene');
    });
    
    // 状态信息显示
    const statusText = this.add.text(10, 10, `当前场景: ${this.currentScene}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    // 菜单场景无需更新逻辑
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentScene = 'GameScene'; // 状态信号
    this.score = 0; // 游戏分数状态
    this.level = 1; // 游戏关卡状态
    this.gameTime = 0; // 游戏时间
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
    
    // 添加标题
    const titleText = this.add.text(width / 2, 60, '游戏场景', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);
    
    // 显示游戏状态信息
    this.statusText = this.add.text(width / 2, height / 2 - 50, '', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5, 0.5);
    this.updateStatusText();
    
    // 创建一个简单的游戏对象示例（绿色方块）
    const player = this.add.graphics();
    player.fillStyle(0x00ff00, 1);
    player.fillRect(width / 2 - 25, height / 2 + 50, 50, 50);
    
    // 添加说明文本
    const instructionText = this.add.text(width / 2, height - 100, '点击屏幕增加分数\n按 ESC 返回菜单', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center'
    });
    instructionText.setOrigin(0.5, 0.5);
    
    // 点击增加分数
    this.input.on('pointerdown', () => {
      this.score += 10;
      if (this.score % 50 === 0) {
        this.level++;
      }
      this.updateStatusText();
    });
    
    // ESC 键返回菜单
    this.input.keyboard.on('keydown-ESC', () => {
      console.log('返回 MenuScene');
      this.scene.start('MenuScene');
    });
    
    // 场景信息显示
    const sceneInfo = this.add.text(10, 10, `当前场景: ${this.currentScene}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime += delta;
  }

  updateStatusText() {
    const timeInSeconds = Math.floor(this.gameTime / 1000);
    this.statusText.setText(
      `分数: ${this.score}\n` +
      `关卡: ${this.level}\n` +
      `游戏时间: ${timeInSeconds}秒`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene 为默认启动场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口（用于验证）
window.getGameState = function() {
  const currentScene = game.scene.getScenes(true)[0];
  return {
    currentSceneName: currentScene.scene.key,
    score: currentScene.score || 0,
    level: currentScene.level || 1,
    gameTime: currentScene.gameTime || 0
  };
};

console.log('游戏已启动，当前场景: MenuScene');
console.log('使用 window.getGameState() 查看游戏状态');