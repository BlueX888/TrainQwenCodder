class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 10;
    this.level = 1;
    this.SAVE_KEY = 'phaser_game_save';
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 尝试加载存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, 'Game Save System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示当前状态
    this.scoreText = this.add.text(400, 150, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#00ff00'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 200, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#00ffff'
    });
    this.levelText.setOrigin(0.5);

    // 创建状态指示器
    this.statusText = this.add.text(400, 250, 'Ready', {
      fontSize: '18px',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 创建按钮
    this.createButton(200, 350, 'Add Score (+10)', 0x4a90e2, () => {
      this.score += 10;
      this.updateDisplay();
      this.showStatus('Score increased!');
    });

    this.createButton(200, 420, 'Level Up', 0x7b68ee, () => {
      this.level += 1;
      this.updateDisplay();
      this.showStatus('Level up!');
    });

    this.createButton(600, 350, 'Save Game', 0x50c878, () => {
      this.saveGame();
      this.showStatus('Game saved!', 0x00ff00);
    });

    this.createButton(600, 420, 'Reset Save', 0xe74c3c, () => {
      this.resetGame();
      this.showStatus('Save reset!', 0xff0000);
    });

    // 添加说明文本
    const instructions = this.add.text(400, 520, 
      'Keys: [S] Add Score | [L] Level Up | [SPACE] Save | [R] Reset', {
      fontSize: '14px',
      color: '#888888'
    });
    instructions.setOrigin(0.5);

    // 添加存档状态显示
    this.saveInfoText = this.add.text(400, 560, '', {
      fontSize: '12px',
      color: '#666666'
    });
    this.saveInfoText.setOrigin(0.5);
    this.updateSaveInfo();

    // 键盘控制
    this.input.keyboard.on('keydown-S', () => {
      this.score += 10;
      this.updateDisplay();
      this.showStatus('Score increased!');
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
      this.showStatus('Level up!');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.saveGame();
      this.showStatus('Game saved!', 0x00ff00);
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
      this.showStatus('Save reset!', 0xff0000);
    });

    // 初始状态显示
    if (this.wasLoaded) {
      this.showStatus('Save loaded!', 0x00ff00);
    }
  }

  createButton(x, y, text, color, callback) {
    const width = 180;
    const height = 50;

    // 创建按钮背景
    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    button.setInteractive(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    // 创建按钮文本
    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 添加交互效果
    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    });

    button.on('pointerdown', () => {
      button.clear();
      button.fillStyle(color, 0.6);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      callback();
      
      // 恢复按钮状态
      this.time.delayedCall(100, () => {
        button.clear();
        button.fillStyle(color, 1);
        button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
      });
    });

    return { button, buttonText };
  }

  saveGame() {
    const saveData = {
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('Game saved:', saveData);
      this.updateSaveInfo();
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      this.showStatus('Save failed!', 0xff0000);
      return false;
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || 10;
        this.level = data.level || 1;
        this.wasLoaded = true;
        console.log('Game loaded:', data);
        return true;
      } else {
        console.log('No save data found, using defaults');
        this.wasLoaded = false;
        return false;
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      this.wasLoaded = false;
      return false;
    }
  }

  resetGame() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      this.score = 10;
      this.level = 1;
      this.updateDisplay();
      this.updateSaveInfo();
      console.log('Game reset to defaults');
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  updateSaveInfo() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        const date = new Date(data.timestamp);
        this.saveInfoText.setText(
          `Last saved: ${date.toLocaleString()}`
        );
      } else {
        this.saveInfoText.setText('No save data');
      }
    } catch (error) {
      this.saveInfoText.setText('Save info unavailable');
    }
  }

  showStatus(message, color = 0xffff00) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后恢复默认状态
    this.time.delayedCall(2000, () => {
      this.statusText.setText('Ready');
      this.statusText.setColor('#ffff00');
    });
  }

  update(time, delta) {
    // 游戏循环（本示例不需要持续更新）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于测试验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    level: scene.level,
    savedData: localStorage.getItem(scene.SAVE_KEY)
  };
};

console.log('Game started. Use buttons or keyboard shortcuts to interact.');
console.log('Call window.getGameState() to check current state.');