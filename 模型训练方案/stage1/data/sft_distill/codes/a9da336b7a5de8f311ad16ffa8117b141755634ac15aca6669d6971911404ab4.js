class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 8;
    this.level = 1;
    this.saveKey = 'phaser3_save_data';
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 从 localStorage 加载存档
    this.loadGame();

    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 绘制标题背景
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x333333, 1);
    titleBg.fillRect(50, 30, 700, 80);

    // 标题
    this.add.text(400, 70, '简单存档系统', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示区域背景
    const displayBg = this.add.graphics();
    displayBg.fillStyle(0x1a1a1a, 1);
    displayBg.fillRect(100, 150, 600, 150);

    // 显示当前分数和等级
    this.scoreText = this.add.text(400, 190, `分数: ${this.score}`, {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.levelText = this.add.text(400, 240, `等级: ${this.level}`, {
      fontSize: '28px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 状态提示文本
    this.statusText = this.add.text(400, 280, '数据已加载', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // 创建按钮
    this.createButton(150, 380, 150, 50, '增加分数 (+5)', 0x00aa00, () => {
      this.score += 5;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('分数已增加并保存');
    });

    this.createButton(325, 380, 150, 50, '增加等级 (+1)', 0xaa6600, () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('等级已提升并保存');
    });

    this.createButton(500, 380, 150, 50, '重置数据', 0xaa0000, () => {
      this.score = 8;
      this.level = 1;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('数据已重置为默认值');
    });

    this.createButton(250, 460, 300, 50, '手动保存', 0x0066aa, () => {
      this.saveGame();
      this.showStatus('数据已手动保存');
    });

    // 添加说明文本
    this.add.text(400, 540, '提示：关闭并重新打开页面，数据将自动恢复', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(400, 560, '快捷键: [S]增加分数 [L]增加等级 [R]重置 [空格]保存', {
      fontSize: '12px',
      color: '#555555'
    }).setOrigin(0.5);

    // 添加键盘控制
    this.input.keyboard.on('keydown-S', () => {
      this.score += 5;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('分数已增加并保存 (快捷键)');
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('等级已提升并保存 (快捷键)');
    });

    this.input.keyboard.on('keydown-R', () => {
      this.score = 8;
      this.level = 1;
      this.updateDisplay();
      this.saveGame();
      this.showStatus('数据已重置 (快捷键)');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.saveGame();
      this.showStatus('数据已手动保存 (快捷键)');
    });

    // 初始状态显示
    this.updateDisplay();
  }

  createButton(x, y, width, height, text, color, callback) {
    // 按钮背景
    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x, y, width, height, 8);

    // 按钮文本
    const buttonText = this.add.text(x + width / 2, y + height / 2, text, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建交互区域
    const zone = this.add.zone(x, y, width, height).setOrigin(0, 0).setInteractive();

    // 鼠标悬停效果
    zone.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x, y, width, height, 8);
      buttonText.setScale(1.05);
    });

    zone.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x, y, width, height, 8);
      buttonText.setScale(1);
    });

    // 点击事件
    zone.on('pointerdown', () => {
      button.clear();
      button.fillStyle(color, 0.6);
      button.fillRoundedRect(x, y, width, height, 8);
      buttonText.setScale(0.95);
    });

    zone.on('pointerup', () => {
      button.clear();
      button.fillStyle(color, 0.8);
      button.fillRoundedRect(x, y, width, height, 8);
      buttonText.setScale(1.05);
      callback();
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
      console.log('游戏已保存:', saveData);
    } catch (error) {
      console.error('保存失败:', error);
      this.showStatus('保存失败！');
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score !== undefined ? data.score : 8;
        this.level = data.level !== undefined ? data.level : 1;
        console.log('游戏已加载:', data);
      } else {
        // 首次运行，使用默认值
        this.score = 8;
        this.level = 1;
        console.log('首次运行，使用默认值');
      }
    } catch (error) {
      console.error('加载失败:', error);
      this.score = 8;
      this.level = 1;
    }
  }

  updateDisplay() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
  }

  showStatus(message) {
    this.statusText.setText(message);
    this.statusText.setColor('#00ff00');
    
    // 2秒后恢复默认颜色
    this.time.delayedCall(2000, () => {
      this.statusText.setColor('#888888');
    });
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);