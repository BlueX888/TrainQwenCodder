class SaveGameScene extends Phaser.Scene {
  constructor() {
    super('SaveGameScene');
    this.score = 8;  // 默认起始分数
    this.level = 1;  // 默认起始等级
    this.SAVE_KEY_SCORE = 'phaser_game_score';
    this.SAVE_KEY_LEVEL = 'phaser_game_level';
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 从 localStorage 加载存档
    this.loadGame();

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 50, 'Save Game System', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示当前状态
    this.scoreText = this.add.text(400, 150, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.levelText = this.add.text(400, 200, `Level: ${this.level}`, {
      fontSize: '28px',
      color: '#ffaa00'
    }).setOrigin(0.5);

    // 创建操作按钮
    this.createButton(200, 300, 'Add Score (+10)', 0x4CAF50, () => {
      this.score += 10;
      this.updateDisplay();
      this.saveGame();
    });

    this.createButton(200, 370, 'Level Up', 0x2196F3, () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGame();
    });

    this.createButton(600, 300, 'Reset Save', 0xF44336, () => {
      this.resetGame();
    });

    this.createButton(600, 370, 'Manual Save', 0xFF9800, () => {
      this.saveGame();
      this.showSaveMessage();
    });

    // 显示说明文字
    this.add.text(400, 480, 'Controls:', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 510, 'S: Add Score | L: Level Up | R: Reset | Space: Save', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 显示存档状态
    this.saveStatusText = this.add.text(400, 550, 'Game loaded from save', {
      fontSize: '14px',
      color: '#00ff00',
      alpha: 0
    }).setOrigin(0.5);

    // 键盘控制
    this.input.keyboard.on('keydown-S', () => {
      this.score += 10;
      this.updateDisplay();
      this.saveGame();
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGame();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.saveGame();
      this.showSaveMessage();
    });

    // 初始显示加载消息
    if (this.hasExistingSave()) {
      this.showLoadMessage();
    }
  }

  // 创建按钮
  createButton(x, y, text, color, callback) {
    const buttonWidth = 180;
    const buttonHeight = 50;

    // 按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(color, 1);
    buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);

    // 按钮文字
    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建交互区域
    const hitArea = new Phaser.Geom.Rectangle(
      x - buttonWidth / 2,
      y - buttonHeight / 2,
      buttonWidth,
      buttonHeight
    );

    buttonText.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // 鼠标悬停效果
    buttonText.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(color, 0.8);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    buttonText.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(color, 1);
      buttonBg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 10);
    });

    // 点击事件
    buttonText.on('pointerdown', callback);
  }

  // 保存游戏到 localStorage
  saveGame() {
    try {
      localStorage.setItem(this.SAVE_KEY_SCORE, this.score.toString());
      localStorage.setItem(this.SAVE_KEY_LEVEL, this.level.toString());
      console.log(`Game saved: Score=${this.score}, Level=${this.level}`);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  // 从 localStorage 加载游戏
  loadGame() {
    try {
      const savedScore = localStorage.getItem(this.SAVE_KEY_SCORE);
      const savedLevel = localStorage.getItem(this.SAVE_KEY_LEVEL);

      if (savedScore !== null) {
        this.score = parseInt(savedScore, 10);
      }

      if (savedLevel !== null) {
        this.level = parseInt(savedLevel, 10);
      }

      console.log(`Game loaded: Score=${this.score}, Level=${this.level}`);
    } catch (error) {
      console.error('Failed to load game:', error);
      // 如果加载失败，使用默认值
      this.score = 8;
      this.level = 1;
    }
  }

  // 检查是否有存档
  hasExistingSave() {
    return localStorage.getItem(this.SAVE_KEY_SCORE) !== null ||
           localStorage.getItem(this.SAVE_KEY_LEVEL) !== null;
  }

  // 重置游戏（清除存档）
  resetGame() {
    try {
      localStorage.removeItem(this.SAVE_KEY_SCORE);
      localStorage.removeItem(this.SAVE_KEY_LEVEL);
      this.score = 8;  // 恢复默认值
      this.level = 1;
      this.updateDisplay();
      this.showResetMessage();
      console.log('Game reset to default values');
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  }

  // 更新显示
  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  // 显示保存消息
  showSaveMessage() {
    this.saveStatusText.setText('Game saved!');
    this.saveStatusText.setColor('#00ff00');
    this.saveStatusText.setAlpha(1);

    this.tweens.add({
      targets: this.saveStatusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });
  }

  // 显示加载消息
  showLoadMessage() {
    this.saveStatusText.setText('Save data loaded successfully');
    this.saveStatusText.setColor('#00aaff');
    this.saveStatusText.setAlpha(1);

    this.tweens.add({
      targets: this.saveStatusText,
      alpha: 0,
      duration: 3000,
      ease: 'Power2'
    });
  }

  // 显示重置消息
  showResetMessage() {
    this.saveStatusText.setText('Save data cleared! Reset to defaults');
    this.saveStatusText.setColor('#ff0000');
    this.saveStatusText.setAlpha(1);

    this.tweens.add({
      targets: this.saveStatusText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: SaveGameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);