class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.SAVE_KEY = 'phaser_game_save';
    this.score = 10;
    this.level = 1;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 尝试加载存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, 'Game Save System', {
      fontSize: '32px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建信息面板
    this.createInfoPanel();

    // 创建显示文本
    this.scoreText = this.add.text(400, 200, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#2ecc71',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 250, `Level: ${this.level}`, {
      fontSize: '28px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // 创建按钮
    this.createButton(200, 350, 'Add Score (+10)', 0x27ae60, () => {
      this.score += 10;
      this.updateDisplay();
    });

    this.createButton(200, 420, 'Level Up', 0x2980b9, () => {
      this.level += 1;
      this.updateDisplay();
    });

    this.createButton(600, 350, 'Save Game', 0xe67e22, () => {
      this.saveGame();
      this.showMessage('Game Saved!', 0x2ecc71);
    });

    this.createButton(600, 420, 'Reset Save', 0xc0392b, () => {
      this.resetSave();
      this.showMessage('Save Reset!', 0xe74c3c);
    });

    // 创建状态指示器
    this.statusText = this.add.text(400, 520, '', {
      fontSize: '20px',
      color: '#ecf0f1'
    });
    this.statusText.setOrigin(0.5);

    // 添加键盘快捷键
    this.input.keyboard.on('keydown-S', () => {
      this.saveGame();
      this.showMessage('Saved (Hotkey)', 0x2ecc71);
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetSave();
      this.showMessage('Reset (Hotkey)', 0xe74c3c);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.score += 10;
      this.updateDisplay();
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
    });

    // 显示启动信息
    const savedData = localStorage.getItem(this.SAVE_KEY);
    if (savedData) {
      this.showMessage('Save Loaded!', 0x3498db);
    } else {
      this.showMessage('New Game Started', 0x95a5a6);
    }
  }

  createInfoPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x34495e, 0.8);
    panel.fillRoundedRect(50, 130, 700, 160, 10);
    panel.lineStyle(3, 0x7f8c8d, 1);
    panel.strokeRoundedRect(50, 130, 700, 160, 10);

    const hint = this.add.text(400, 300, 'Hotkeys: [S]ave | [R]eset | [Space]+Score | [L]evel Up', {
      fontSize: '16px',
      color: '#bdc3c7'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, color, callback) {
    const button = this.add.graphics();
    const width = 180;
    const height = 50;
    
    // 绘制按钮背景
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    
    // 绘制边框
    button.lineStyle(2, 0xecf0f1, 1);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);

    // 添加文本
    const buttonText = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const zone = this.add.zone(x, y, width, height);
    zone.setInteractive({ useHandCursor: true });

    // 悬停效果
    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      button.lineStyle(3, 0xf39c12, 1);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      button.lineStyle(2, 0xecf0f1, 1);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    });

    zone.on('pointerdown', callback);
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
      return true;
    } catch (error) {
      console.error('Save failed:', error);
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
        console.log('Game loaded:', data);
        return true;
      } else {
        console.log('No save data found, starting new game');
        return false;
      }
    } catch (error) {
      console.error('Load failed:', error);
      return false;
    }
  }

  resetSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      this.score = 10;
      this.level = 1;
      this.updateDisplay();
      console.log('Save reset to defaults');
    } catch (error) {
      console.error('Reset failed:', error);
    }
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  showMessage(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 清除之前的定时器
    if (this.messageTimer) {
      this.messageTimer.remove();
    }
    
    // 3秒后清除消息
    this.messageTimer = this.time.delayedCall(3000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 可以在这里添加自动保存逻辑
    // 例如：每30秒自动保存一次
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    level: scene.level,
    hasSave: localStorage.getItem(scene.SAVE_KEY) !== null
  };
};

console.log('Game initialized. Use window.getGameState() to check state.');
console.log('Controls: Click buttons or use hotkeys [S]ave, [R]eset, [Space], [L]');