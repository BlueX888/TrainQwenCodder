// 完整的 Phaser3 存档系统实现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 3; // 默认初始分数
    this.level = 1; // 默认初始等级
    this.saveKey = 'phaser_game_save'; // localStorage 键名
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 从 localStorage 加载存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, 'Phaser3 存档系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建显示面板
    this.createDisplayPanel();

    // 创建分数和等级显示
    this.scoreText = this.add.text(400, 200, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 250, `Level: ${this.level}`, {
      fontSize: '28px',
      color: '#00aaff',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // 创建状态提示文本
    this.statusText = this.add.text(400, 320, '存档已加载', {
      fontSize: '20px',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 创建操作说明
    this.createInstructions();

    // 创建存档信息显示
    this.createSaveInfo();

    // 设置键盘输入
    this.setupInput();

    // 显示加载提示（延迟后消失）
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  createDisplayPanel() {
    // 创建显示面板背景
    const panel = this.add.graphics();
    panel.fillStyle(0x2d2d44, 1);
    panel.fillRoundedRect(250, 150, 300, 200, 10);
    panel.lineStyle(3, 0x4a4a6a, 1);
    panel.strokeRoundedRect(250, 150, 300, 200, 10);
  }

  createInstructions() {
    const instructions = [
      '操作说明：',
      '[空格] - 增加 Score (+1)',
      '[回车] - 增加 Level (+1)',
      '[S] - 保存游戏',
      '[R] - 重置存档'
    ];

    let yPos = 400;
    instructions.forEach((text, index) => {
      const color = index === 0 ? '#ffffff' : '#aaaaaa';
      const fontSize = index === 0 ? '22px' : '18px';
      const instructionText = this.add.text(400, yPos, text, {
        fontSize: fontSize,
        color: color
      });
      instructionText.setOrigin(0.5);
      yPos += 30;
    });
  }

  createSaveInfo() {
    // 显示 localStorage 中的原始数据
    this.saveInfoText = this.add.text(400, 570, '', {
      fontSize: '14px',
      color: '#888888'
    });
    this.saveInfoText.setOrigin(0.5);
    this.updateSaveInfo();
  }

  setupInput() {
    // 空格键：增加分数
    this.input.keyboard.on('keydown-SPACE', () => {
      this.score++;
      this.updateDisplay();
      this.showStatus('Score +1', '#00ff00');
    });

    // 回车键：增加等级
    this.input.keyboard.on('keydown-ENTER', () => {
      this.level++;
      this.updateDisplay();
      this.showStatus('Level +1', '#00aaff');
    });

    // S键：保存游戏
    this.input.keyboard.on('keydown-S', () => {
      this.saveGame();
    });

    // R键：重置存档
    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
    });
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score !== undefined ? data.score : 3;
        this.level = data.level !== undefined ? data.level : 1;
        console.log('存档加载成功:', data);
      } else {
        console.log('未找到存档，使用默认值');
        this.score = 3;
        this.level = 1;
      }
    } catch (error) {
      console.error('加载存档失败:', error);
      this.score = 3;
      this.level = 1;
    }
  }

  saveGame() {
    try {
      const saveData = {
        score: this.score,
        level: this.level,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      console.log('存档保存成功:', saveData);
      this.showStatus('游戏已保存！', '#ffff00');
      this.updateSaveInfo();
      
      // 创建保存动画效果
      this.tweens.add({
        targets: this.statusText,
        scale: { from: 1.2, to: 1 },
        duration: 300,
        ease: 'Back.easeOut'
      });
    } catch (error) {
      console.error('保存存档失败:', error);
      this.showStatus('保存失败！', '#ff0000');
    }
  }

  resetGame() {
    try {
      localStorage.removeItem(this.saveKey);
      this.score = 3;
      this.level = 1;
      this.updateDisplay();
      this.updateSaveInfo();
      this.showStatus('存档已重置！', '#ff6600');
      console.log('存档已重置为默认值');
    } catch (error) {
      console.error('重置存档失败:', error);
    }
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  updateSaveInfo() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        const date = new Date(data.timestamp);
        this.saveInfoText.setText(
          `localStorage: ${JSON.stringify({score: data.score, level: data.level})} | 保存时间: ${date.toLocaleTimeString()}`
        );
      } else {
        this.saveInfoText.setText('localStorage: 无存档数据');
      }
    } catch (error) {
      this.saveInfoText.setText('localStorage: 读取失败');
    }
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
    
    // 2秒后清除状态文本
    if (this.statusTimer) {
      this.statusTimer.remove();
    }
    this.statusTimer = this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
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

// 在控制台输出验证信息
console.log('=== Phaser3 存档系统演示 ===');
console.log('初始值: score=3, level=1');
console.log('使用空格键增加分数，回车键增加等级');
console.log('按 S 键保存，按 R 键重置存档');
console.log('刷新页面验证存档功能');