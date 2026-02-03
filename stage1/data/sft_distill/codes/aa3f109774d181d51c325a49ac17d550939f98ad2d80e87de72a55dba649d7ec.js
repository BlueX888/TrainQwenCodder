// 存档管理类
class SaveGame {
  constructor() {
    this.saveKey = 'phaser_game_save';
  }

  // 保存游戏数据
  save(data) {
    try {
      const saveData = JSON.stringify(data);
      localStorage.setItem(this.saveKey, saveData);
      console.log('Game saved:', data);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  // 读取游戏数据
  load() {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (saveData) {
        const data = JSON.parse(saveData);
        console.log('Game loaded:', data);
        return data;
      }
    } catch (e) {
      console.error('Load failed:', e);
    }
    return null;
  }

  // 删除存档
  clear() {
    try {
      localStorage.removeItem(this.saveKey);
      console.log('Save data cleared');
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      return false;
    }
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.saveGame = new SaveGame();
    this.score = 10; // 默认起始分数
    this.level = 1;  // 默认等级
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 读取存档
    this.loadGameData();

    // 创建背景
    this.createBackground();

    // 创建标题
    this.createTitle();

    // 创建状态显示
    this.createStatusDisplay();

    // 创建按钮
    this.createButtons();

    // 创建提示信息
    this.createInfoText();

    // 自动保存提示
    this.saveIndicator = this.add.text(400, 550, '', {
      fontSize: '16px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
  }

  // 加载游戏数据
  loadGameData() {
    const savedData = this.saveGame.load();
    if (savedData) {
      this.score = savedData.score !== undefined ? savedData.score : 10;
      this.level = savedData.level !== undefined ? savedData.level : 1;
      console.log('Loaded from save:', { score: this.score, level: this.level });
    } else {
      console.log('No save found, using defaults:', { score: this.score, level: this.level });
    }
  }

  // 保存游戏数据
  saveGameData() {
    const success = this.saveGame.save({
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    });

    if (success) {
      this.showSaveIndicator('已保存！');
    }
  }

  // 创建背景
  createBackground() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 装饰性网格
    graphics.lineStyle(1, 0x16213e, 0.3);
    for (let i = 0; i < 800; i += 40) {
      graphics.lineBetween(i, 0, i, 600);
    }
    for (let i = 0; i < 600; i += 40) {
      graphics.lineBetween(0, i, 800, i);
    }
  }

  // 创建标题
  createTitle() {
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x0f3460, 1);
    titleBg.fillRoundedRect(200, 20, 400, 60, 10);
    titleBg.lineStyle(2, 0x16c79a, 1);
    titleBg.strokeRoundedRect(200, 20, 400, 60, 10);

    this.add.text(400, 50, '游戏存档系统', {
      fontSize: '32px',
      color: '#16c79a',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  // 创建状态显示
  createStatusDisplay() {
    // 分数显示背景
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x0f3460, 1);
    scoreBg.fillRoundedRect(150, 120, 200, 80, 10);
    scoreBg.lineStyle(2, 0xffa500, 1);
    scoreBg.strokeRoundedRect(150, 120, 200, 80, 10);

    this.add.text(250, 140, '分数', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(250, 175, this.score.toString(), {
      fontSize: '28px',
      color: '#ffa500',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 等级显示背景
    const levelBg = this.add.graphics();
    levelBg.fillStyle(0x0f3460, 1);
    levelBg.fillRoundedRect(450, 120, 200, 80, 10);
    levelBg.lineStyle(2, 0x00ffff, 1);
    levelBg.strokeRoundedRect(450, 120, 200, 80, 10);

    this.add.text(550, 140, '等级', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.levelText = this.add.text(550, 175, `Lv.${this.level}`, {
      fontSize: '28px',
      color: '#00ffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  // 创建按钮
  createButtons() {
    // 增加分数按钮
    this.createButton(200, 280, 180, 50, '增加分数 (+10)', 0x16c79a, () => {
      this.score += 10;
      this.updateDisplay();
      this.saveGameData();
    });

    // 升级按钮
    this.createButton(420, 280, 180, 50, '升级 (+1)', 0x00a8cc, () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGameData();
    });

    // 保存游戏按钮
    this.createButton(200, 360, 180, 50, '手动保存', 0xffa500, () => {
      this.saveGameData();
    });

    // 重置存档按钮
    this.createButton(420, 360, 180, 50, '重置存档', 0xff4757, () => {
      this.resetGame();
    });
  }

  // 创建单个按钮
  createButton(x, y, width, height, text, color, callback) {
    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x, y, width, height, 8);
    button.lineStyle(2, 0xffffff, 0.8);
    button.strokeRoundedRect(x, y, width, height, 8);

    const buttonText = this.add.text(x + width / 2, y + height / 2, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // 创建交互区域
    const zone = this.add.zone(x, y, width, height).setOrigin(0).setInteractive();

    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x, y, width, height, 8);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x, y, width, height, 8);
      buttonText.setScale(1.05);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x, y, width, height, 8);
      button.lineStyle(2, 0xffffff, 0.8);
      button.strokeRoundedRect(x, y, width, height, 8);
      buttonText.setScale(1);
    });

    zone.on('pointerdown', () => {
      buttonText.setScale(0.95);
      callback();
      this.time.delayedCall(100, () => {
        buttonText.setScale(1.05);
      });
    });
  }

  // 创建信息文本
  createInfoText() {
    const infoBg = this.add.graphics();
    infoBg.fillStyle(0x0f3460, 0.5);
    infoBg.fillRoundedRect(150, 450, 500, 80, 10);

    this.add.text(400, 470, '💾 游戏数据自动保存到 localStorage', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(400, 495, '刷新页面后数据将自动恢复', {
      fontSize: '14px',
      color: '#999999',
      align: 'center'
    }).setOrigin(0.5);
  }

  // 更新显示
  updateDisplay() {
    this.scoreText.setText(this.score.toString());
    this.levelText.setText(`Lv.${this.level}`);

    // 添加动画效果
    this.tweens.add({
      targets: [this.scoreText, this.levelText],
      scale: { from: 1.2, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  // 显示保存指示器
  showSaveIndicator(message) {
    this.saveIndicator.setText(message);
    this.saveIndicator.setAlpha(1);

    this.tweens.add({
      targets: this.saveIndicator,
      alpha: 0,
      duration: 2000,
      ease: 'Power2'
    });
  }

  // 重置游戏
  resetGame() {
    this.saveGame.clear();
    this.score = 10;
    this.level = 1;
    this.updateDisplay();
    this.showSaveIndicator('存档已重置！');
    console.log('Game reset to defaults');
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
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

// 启动游戏
const game = new Phaser.Game(config);