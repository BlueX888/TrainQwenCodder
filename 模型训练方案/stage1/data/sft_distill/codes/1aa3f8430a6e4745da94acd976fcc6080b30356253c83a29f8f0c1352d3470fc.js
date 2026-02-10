class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 15;  // 默认起始分数
    this.level = 1;   // 默认起始等级
    this.saveKey = 'phaser_game_save';
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

    // 标题
    const title = this.add.text(400, 50, 'Game Save System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示存档状态
    this.saveStatusText = this.add.text(400, 100, '', {
      fontSize: '18px',
      color: '#00ff00'
    });
    this.saveStatusText.setOrigin(0.5);
    this.updateSaveStatus();

    // 显示当前数据区域
    const dataBg = this.add.graphics();
    dataBg.fillStyle(0x16213e, 1);
    dataBg.fillRoundedRect(250, 150, 300, 120, 10);
    dataBg.lineStyle(2, 0x0f3460, 1);
    dataBg.strokeRoundedRect(250, 150, 300, 120, 10);

    this.add.text(400, 170, 'Current Game State', {
      fontSize: '20px',
      color: '#e94560',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 分数显示
    this.scoreText = this.add.text(280, 210, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.updateScoreText();

    // 等级显示
    this.levelText = this.add.text(280, 240, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.updateLevelText();

    // 创建操作按钮
    this.createButton(200, 320, 'Add Score (+10)', 0x4a90e2, () => {
      this.score += 10;
      this.updateScoreText();
      this.showMessage('Score increased!', 0x00ff00);
    });

    this.createButton(200, 380, 'Level Up', 0x7b68ee, () => {
      this.level += 1;
      this.updateLevelText();
      this.showMessage('Level up!', 0xffaa00);
    });

    this.createButton(200, 440, 'Save Game', 0x50c878, () => {
      this.saveGame();
      this.showMessage('Game saved successfully!', 0x00ff00);
    });

    this.createButton(200, 500, 'Clear Save', 0xe74c3c, () => {
      this.clearSave();
      this.showMessage('Save cleared!', 0xff0000);
    });

    this.createButton(450, 320, 'Reset to Default', 0xff6b6b, () => {
      this.score = 15;
      this.level = 1;
      this.updateScoreText();
      this.updateLevelText();
      this.showMessage('Reset to default values!', 0xffaa00);
    });

    this.createButton(450, 380, 'Load Game', 0x3498db, () => {
      const loaded = this.loadGame();
      if (loaded) {
        this.updateScoreText();
        this.updateLevelText();
        this.showMessage('Game loaded from save!', 0x00ff00);
      } else {
        this.showMessage('No save found!', 0xff0000);
      }
    });

    // 消息文本（用于显示操作反馈）
    this.messageText = this.add.text(400, 560, '', {
      fontSize: '16px',
      color: '#ffffff'
    });
    this.messageText.setOrigin(0.5);

    // 添加键盘快捷键
    this.input.keyboard.on('keydown-S', () => {
      this.saveGame();
      this.showMessage('Game saved! (Shortcut: S)', 0x00ff00);
    });

    this.input.keyboard.on('keydown-L', () => {
      this.loadGame();
      this.updateScoreText();
      this.updateLevelText();
      this.showMessage('Game loaded! (Shortcut: L)', 0x00ff00);
    });

    // 添加说明文字
    this.add.text(400, 20, 'Press S to Save | Press L to Load', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);

    console.log('=== Game Initialized ===');
    console.log('Initial Score:', this.score);
    console.log('Initial Level:', this.level);
  }

  createButton(x, y, text, color, callback) {
    const width = 200;
    const height = 40;

    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x, y, width, height, 5);
    button.lineStyle(2, 0xffffff, 0.5);
    button.strokeRoundedRect(x, y, width, height, 5);

    const buttonText = this.add.text(x + width / 2, y + height / 2, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const zone = this.add.zone(x, y, width, height).setOrigin(0, 0);
    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x, y, width, height, 5);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x, y, width, height, 5);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x, y, width, height, 5);
      button.lineStyle(2, 0xffffff, 0.5);
      button.strokeRoundedRect(x, y, width, height, 5);
    });

    zone.on('pointerdown', () => {
      button.clear();
      button.fillStyle(color, 0.6);
      button.fillRoundedRect(x, y, width, height, 5);
      button.lineStyle(2, 0xffffff, 0.5);
      button.strokeRoundedRect(x, y, width, height, 5);
      callback();
    });

    zone.on('pointerup', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x, y, width, height, 5);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x, y, width, height, 5);
    });
  }

  updateScoreText() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateLevelText() {
    this.levelText.setText(`Level: ${this.level}`);
  }

  updateSaveStatus() {
    const saveData = localStorage.getItem(this.saveKey);
    if (saveData) {
      const data = JSON.parse(saveData);
      this.saveStatusText.setText(`Save found: Score ${data.score}, Level ${data.level}`);
      this.saveStatusText.setColor('#00ff00');
    } else {
      this.saveStatusText.setText('No save found');
      this.saveStatusText.setColor('#888888');
    }
  }

  showMessage(text, color) {
    this.messageText.setText(text);
    this.messageText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 清除之前的定时器
    if (this.messageTimer) {
      this.messageTimer.remove();
    }
    
    // 3秒后清除消息
    this.messageTimer = this.time.delayedCall(3000, () => {
      this.messageText.setText('');
    });
  }

  saveGame() {
    const saveData = {
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      this.updateSaveStatus();
      console.log('=== Game Saved ===');
      console.log('Saved Score:', this.score);
      console.log('Saved Level:', this.level);
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  loadGame() {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (saveData) {
        const data = JSON.parse(saveData);
        this.score = data.score || 15;
        this.level = data.level || 1;
        console.log('=== Game Loaded ===');
        console.log('Loaded Score:', this.score);
        console.log('Loaded Level:', this.level);
        this.updateSaveStatus();
        return true;
      } else {
        console.log('No save data found, using defaults');
        this.updateSaveStatus();
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
      console.log('=== Save Cleared ===');
      this.updateSaveStatus();
      return true;
    } catch (e) {
      console.error('Failed to clear save:', e);
      return false;
    }
  }

  update(time, delta) {
    // 不需要持续更新逻辑
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

// 导出验证接口
window.gameState = {
  getScore: () => game.scene.scenes[0].score,
  getLevel: () => game.scene.scenes[0].level,
  getSaveData: () => {
    const data = localStorage.getItem('phaser_game_save');
    return data ? JSON.parse(data) : null;
  }
};

console.log('Game initialized. Use window.gameState to check state.');
console.log('Available methods: getScore(), getLevel(), getSaveData()');