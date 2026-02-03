// 存档系统类
class SaveSystem {
  constructor(saveKey = 'phaser_game_save') {
    this.saveKey = saveKey;
  }

  // 保存游戏数据
  save(data) {
    try {
      const saveData = {
        score: data.score || 12,
        level: data.level || 1,
        timestamp: Date.now()
      };
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  // 加载游戏数据
  load() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        return {
          score: data.score || 12,
          level: data.level || 1,
          timestamp: data.timestamp || 0
        };
      }
    } catch (e) {
      console.error('Load failed:', e);
    }
    // 返回默认值
    return { score: 12, level: 1, timestamp: 0 };
  }

  // 清除存档
  clear() {
    try {
      localStorage.removeItem(this.saveKey);
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      return false;
    }
  }

  // 检查是否有存档
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.saveSystem = new SaveSystem('phaser_game_save');
    this.score = 12;
    this.level = 1;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 加载存档数据
    const savedData = this.saveSystem.load();
    this.score = savedData.score;
    this.level = savedData.level;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, '游戏存档系统', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示存档状态
    const hasSave = this.saveSystem.hasSave();
    const saveStatus = this.add.text(400, 100, 
      hasSave ? `已加载存档 (${new Date(savedData.timestamp).toLocaleTimeString()})` : '新游戏', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: hasSave ? '#4ecca3' : '#ffaa00'
    });
    saveStatus.setOrigin(0.5);

    // 创建数据显示面板
    this.createDataPanel();

    // 创建按钮
    this.createButtons();

    // 创建保存反馈文本
    this.saveMessageText = this.add.text(400, 500, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#4ecca3'
    });
    this.saveMessageText.setOrigin(0.5);
    this.saveMessageText.setAlpha(0);

    // 创建说明文本
    const instructions = this.add.text(400, 560, '使用按钮操作，数据会自动保存到 localStorage', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    instructions.setOrigin(0.5);

    // 键盘快捷键
    this.input.keyboard.on('keydown-S', () => {
      this.manualSave();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
    });
  }

  createDataPanel() {
    // 面板背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x2d2d44, 1);
    panelBg.fillRoundedRect(250, 150, 300, 150, 10);
    panelBg.lineStyle(2, 0x4ecca3, 1);
    panelBg.strokeRoundedRect(250, 150, 300, 150, 10);

    // Score 显示
    this.add.text(280, 180, 'Score:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.scoreText = this.add.text(480, 180, this.score.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4ecca3',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(1, 0);

    // Level 显示
    this.add.text(280, 240, 'Level:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.levelText = this.add.text(480, 240, this.level.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(1, 0);
  }

  createButtons() {
    const buttonConfigs = [
      { x: 200, y: 350, text: '+10 分数', color: 0x4ecca3, action: () => this.addScore(10) },
      { x: 400, y: 350, text: '升级', color: 0xffaa00, action: () => this.levelUp() },
      { x: 600, y: 350, text: '保存 (S)', color: 0x5588ff, action: () => this.manualSave() },
      { x: 400, y: 430, text: '重置游戏 (R)', color: 0xff5555, action: () => this.resetGame() }
    ];

    buttonConfigs.forEach(config => {
      this.createButton(config.x, config.y, config.text, config.color, config.action);
    });
  }

  createButton(x, y, text, color, callback) {
    const button = this.add.graphics();
    const width = 160;
    const height = 50;

    // 绘制按钮
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    button.lineStyle(2, 0xffffff, 0.5);
    button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);

    // 按钮文本
    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 交互区域
    const hitArea = new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height);
    button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // 悬停效果
    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      buttonText.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      button.lineStyle(2, 0xffffff, 0.5);
      button.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      buttonText.setScale(1);
    });

    button.on('pointerdown', () => {
      buttonText.setScale(0.95);
      callback();
      this.time.delayedCall(100, () => {
        buttonText.setScale(1.1);
      });
    });
  }

  addScore(amount) {
    this.score += amount;
    this.updateDisplay();
    this.autoSave();
  }

  levelUp() {
    this.level += 1;
    this.updateDisplay();
    this.autoSave();
  }

  manualSave() {
    const success = this.saveSystem.save({
      score: this.score,
      level: this.level
    });
    
    if (success) {
      this.showSaveMessage('游戏已保存！');
    } else {
      this.showSaveMessage('保存失败！', 0xff5555);
    }
  }

  autoSave() {
    this.saveSystem.save({
      score: this.score,
      level: this.level
    });
    this.showSaveMessage('自动保存', 0x4ecca3, 1000);
  }

  resetGame() {
    this.saveSystem.clear();
    this.score = 12;
    this.level = 1;
    this.updateDisplay();
    this.showSaveMessage('游戏已重置！', 0xffaa00);
  }

  updateDisplay() {
    this.scoreText.setText(this.score.toString());
    this.levelText.setText(this.level.toString());
  }

  showSaveMessage(message, color = 0x4ecca3, duration = 1500) {
    this.saveMessageText.setText(message);
    this.saveMessageText.setColor('#' + color.toString(16).padStart(6, '0'));
    this.saveMessageText.setAlpha(1);

    this.tweens.add({
      targets: this.saveMessageText,
      alpha: 0,
      duration: duration,
      delay: 500,
      ease: 'Power2'
    });
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证接口（用于测试）
window.gameState = {
  getScore: () => game.scene.scenes[0].score,
  getLevel: () => game.scene.scenes[0].level,
  getSaveData: () => {
    const saveSystem = new SaveSystem('phaser_game_save');
    return saveSystem.load();
  }
};