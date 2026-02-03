class SaveGameScene extends Phaser.Scene {
  constructor() {
    super('SaveGameScene');
    this.score = 8;  // 默认起始分数
    this.level = 1;  // 默认起始等级
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
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, 'LocalStorage 存档系统', {
      fontSize: '32px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建显示区域背景
    const displayBg = this.add.graphics();
    displayBg.fillStyle(0x34495e, 1);
    displayBg.fillRoundedRect(200, 120, 400, 120, 10);

    // 创建分数显示
    this.scoreText = this.add.text(400, 150, `分数: ${this.score}`, {
      fontSize: '28px',
      color: '#3498db',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);

    // 创建等级显示
    this.levelText = this.add.text(400, 190, `等级: ${this.level}`, {
      fontSize: '28px',
      color: '#2ecc71',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // 创建操作按钮
    this.createButton(250, 300, '增加分数 (+10)', 0x3498db, () => {
      this.score += 10;
      this.updateDisplay();
    });

    this.createButton(550, 300, '增加等级 (+1)', 0x2ecc71, () => {
      this.level += 1;
      this.updateDisplay();
    });

    this.createButton(250, 380, '保存游戏', 0x27ae60, () => {
      this.saveGame();
    });

    this.createButton(550, 380, '清除存档', 0xe74c3c, () => {
      this.clearSave();
    });

    this.createButton(400, 460, '重置为默认值', 0x95a5a6, () => {
      this.resetToDefault();
    });

    // 创建状态提示文本
    this.statusText = this.add.text(400, 530, '', {
      fontSize: '20px',
      color: '#f39c12'
    });
    this.statusText.setOrigin(0.5);

    // 显示初始加载状态
    const savedData = localStorage.getItem(this.saveKey);
    if (savedData) {
      this.showStatus('已从存档加载数据', 0x2ecc71);
    } else {
      this.showStatus('使用默认值（无存档）', 0x95a5a6);
    }

    // 添加键盘快捷键
    this.input.keyboard.on('keydown-S', () => {
      this.saveGame();
    });

    this.input.keyboard.on('keydown-C', () => {
      this.clearSave();
    });

    // 显示快捷键提示
    const hint = this.add.text(400, 570, '快捷键: S=保存  C=清除', {
      fontSize: '16px',
      color: '#7f8c8d'
    });
    hint.setOrigin(0.5);
  }

  createButton(x, y, text, color, callback) {
    const width = 200;
    const height = 50;

    // 按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(color, 1);
    buttonBg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);

    // 按钮文本
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
      buttonBg.clear();
      buttonBg.fillStyle(color, 0.8);
      buttonBg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
    });

    zone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(color, 1);
      buttonBg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
    });

    // 点击事件
    zone.on('pointerdown', () => {
      buttonBg.clear();
      buttonBg.fillStyle(color, 0.6);
      buttonBg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
      callback();
      
      // 恢复原状
      this.time.delayedCall(100, () => {
        buttonBg.clear();
        buttonBg.fillStyle(color, 1);
        buttonBg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
      });
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
      this.showStatus('游戏已保存！', 0x2ecc71);
      console.log('Save successful:', saveData);
    } catch (error) {
      this.showStatus('保存失败！', 0xe74c3c);
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || 8;
        this.level = data.level || 1;
        console.log('Load successful:', data);
        return true;
      } else {
        console.log('No save data found, using defaults');
        return false;
      }
    } catch (error) {
      console.error('Load error:', error);
      this.score = 8;
      this.level = 1;
      return false;
    }
  }

  clearSave() {
    try {
      localStorage.removeItem(this.saveKey);
      this.showStatus('存档已清除！', 0xe74c3c);
      console.log('Save cleared');
    } catch (error) {
      this.showStatus('清除失败！', 0xe74c3c);
      console.error('Clear error:', error);
    }
  }

  resetToDefault() {
    this.score = 8;
    this.level = 1;
    this.updateDisplay();
    this.showStatus('已重置为默认值（未保存）', 0x95a5a6);
  }

  updateDisplay() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 3秒后清除状态
    this.time.delayedCall(3000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 不需要每帧更新
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: SaveGameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);