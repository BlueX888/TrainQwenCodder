class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 15;  // 默认起始分数
    this.level = 1;   // 默认起始等级
    this.saveKey = 'phaser_game_save';
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 从 localStorage 加载存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    const title = this.add.text(400, 50, 'Game Save System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示当前状态
    this.scoreText = this.add.text(400, 150, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#00ff00'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 200, `Level: ${this.level}`, {
      fontSize: '28px',
      color: '#ffaa00'
    });
    this.levelText.setOrigin(0.5);

    // 创建按钮
    this.createButton(200, 300, 'Add Score (+10)', () => {
      this.score += 10;
      this.updateDisplay();
      this.saveGame();
    });

    this.createButton(200, 370, 'Level Up', () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGame();
    });

    this.createButton(600, 300, 'Save Game', () => {
      this.saveGame();
      this.showMessage('Game Saved!', 0x00ff00);
    });

    this.createButton(600, 370, 'Clear Save', () => {
      this.clearSave();
      this.showMessage('Save Cleared!', 0xff0000);
    });

    this.createButton(400, 500, 'Reset to Default', () => {
      this.score = 15;
      this.level = 1;
      this.updateDisplay();
      this.saveGame();
      this.showMessage('Reset to Score:15, Level:1', 0xffaa00);
    });

    // 显示存档状态信息
    this.statusText = this.add.text(400, 560, '', {
      fontSize: '16px',
      color: '#888888'
    });
    this.statusText.setOrigin(0.5);

    // 初始显示存档状态
    this.checkSaveStatus();
  }

  createButton(x, y, text, callback) {
    // 创建按钮背景
    const button = this.add.graphics();
    button.fillStyle(0x4a4a8a, 1);
    button.fillRoundedRect(x - 90, y - 25, 180, 50, 10);
    button.lineStyle(2, 0x6a6aaa, 1);
    button.strokeRoundedRect(x - 90, y - 25, 180, 50, 10);

    // 创建按钮文本
    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const zone = this.add.zone(x, y, 180, 50).setOrigin(0.5);
    zone.setInteractive({ useHandCursor: true });

    // 添加悬停效果
    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x6a6aaa, 1);
      button.fillRoundedRect(x - 90, y - 25, 180, 50, 10);
      button.lineStyle(2, 0x8a8acc, 1);
      button.strokeRoundedRect(x - 90, y - 25, 180, 50, 10);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4a4a8a, 1);
      button.fillRoundedRect(x - 90, y - 25, 180, 50, 10);
      button.lineStyle(2, 0x6a6aaa, 1);
      button.strokeRoundedRect(x - 90, y - 25, 180, 50, 10);
    });

    zone.on('pointerdown', () => {
      button.clear();
      button.fillStyle(0x3a3a6a, 1);
      button.fillRoundedRect(x - 90, y - 25, 180, 50, 10);
      button.lineStyle(2, 0x5a5a9a, 1);
      button.strokeRoundedRect(x - 90, y - 25, 180, 50, 10);
    });

    zone.on('pointerup', () => {
      button.clear();
      button.fillStyle(0x6a6aaa, 1);
      button.fillRoundedRect(x - 90, y - 25, 180, 50, 10);
      button.lineStyle(2, 0x8a8acc, 1);
      button.strokeRoundedRect(x - 90, y - 25, 180, 50, 10);
      callback();
    });
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  saveGame() {
    const saveData = {
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      console.log('Game saved:', saveData);
      this.checkSaveStatus();
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || 15;
        this.level = data.level || 1;
        console.log('Game loaded:', data);
        return true;
      } else {
        console.log('No save data found, using defaults');
        return false;
      }
    } catch (e) {
      console.error('Failed to load game:', e);
      return false;
    }
  }

  clearSave() {
    try {
      localStorage.removeItem(this.saveKey);
      this.score = 15;
      this.level = 1;
      this.updateDisplay();
      console.log('Save cleared');
      this.checkSaveStatus();
    } catch (e) {
      console.error('Failed to clear save:', e);
    }
  }

  checkSaveStatus() {
    const savedData = localStorage.getItem(this.saveKey);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const date = new Date(data.timestamp);
        this.statusText.setText(`Last saved: ${date.toLocaleString()}`);
      } catch (e) {
        this.statusText.setText('Save data exists');
      }
    } else {
      this.statusText.setText('No save data');
    }
  }

  showMessage(text, color) {
    // 创建临时消息
    const message = this.add.text(400, 450, text, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba
    });
    message.setOrigin(0.5);
    message.setPadding(10, 5);

    // 2秒后消失
    this.time.delayedCall(2000, () => {
      message.destroy();
    });
  }

  update(time, delta) {
    // 可以在这里添加自动保存逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出游戏状态供外部验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    level: scene.level,
    hasSave: localStorage.getItem(scene.saveKey) !== null
  };
};

// 控制台辅助函数
window.printSave = function() {
  const scene = game.scene.scenes[0];
  const savedData = localStorage.getItem(scene.saveKey);
  if (savedData) {
    console.log('Current save data:', JSON.parse(savedData));
  } else {
    console.log('No save data found');
  }
};