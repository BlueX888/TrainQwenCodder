// 游戏存档键名
const SAVE_KEY = 'phaser_game_save';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 3; // 初始分数
    this.level = 1; // 初始等级
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 尝试加载存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建游戏区域框
    const frame = this.add.graphics();
    frame.lineStyle(4, 0x16213e, 1);
    frame.strokeRect(50, 50, 700, 500);

    // 创建标题
    const title = this.add.text(400, 80, 'Game Save System', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#0f3460',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示当前状态
    this.scoreText = this.add.text(400, 180, `Score: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#e94560'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 240, `Level: ${this.level}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#e94560'
    });
    this.levelText.setOrigin(0.5);

    // 创建状态指示器（可视化当前数据）
    this.createStatusIndicator();

    // 显示操作说明
    const instructions = [
      'Controls:',
      'S - Add Score (+10)',
      'L - Level Up (+1)',
      'SPACE - Save Game',
      'R - Reset Save',
      '',
      'Game auto-loads on start!'
    ];

    let yPos = 320;
    instructions.forEach(line => {
      const text = this.add.text(400, yPos, line, {
        fontSize: line === 'Controls:' ? '24px' : '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: line === 'Controls:' ? 'bold' : 'normal'
      });
      text.setOrigin(0.5);
      yPos += line === '' ? 10 : 30;
    });

    // 显示存档状态
    this.saveStatusText = this.add.text(400, 530, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#4ecca3'
    });
    this.saveStatusText.setOrigin(0.5);

    // 键盘输入
    this.input.keyboard.on('keydown-S', () => {
      this.score += 10;
      this.updateDisplay();
      this.showMessage('Score increased!');
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
      this.showMessage('Level up!');
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.saveGame();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
    });

    // 初始化时显示加载信息
    if (this.wasLoaded) {
      this.showMessage('Game loaded from save!', 3000);
    } else {
      this.showMessage('New game started!', 3000);
    }
  }

  createStatusIndicator() {
    // 创建分数条（可视化分数）
    if (this.scoreBar) {
      this.scoreBar.destroy();
    }
    
    this.scoreBar = this.add.graphics();
    const barWidth = Math.min(this.score * 5, 600);
    this.scoreBar.fillStyle(0xe94560, 1);
    this.scoreBar.fillRect(100, 270, barWidth, 20);
    
    // 创建等级指示器（圆点）
    if (this.levelDots) {
      this.levelDots.forEach(dot => dot.destroy());
    }
    
    this.levelDots = [];
    const startX = 400 - (this.level * 15);
    for (let i = 0; i < this.level; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0x4ecca3, 1);
      dot.fillCircle(startX + i * 30, 300, 8);
      this.levelDots.push(dot);
    }
  }

  updateDisplay() {
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
    
    // 更新可视化指示器
    this.createStatusIndicator();
  }

  saveGame() {
    const saveData = {
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this.showMessage('Game saved successfully!', 2000);
      console.log('Game saved:', saveData);
    } catch (error) {
      this.showMessage('Save failed!', 2000);
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || 3;
        this.level = data.level || 1;
        this.wasLoaded = true;
        console.log('Game loaded:', data);
      } else {
        this.wasLoaded = false;
        console.log('No save data found, starting new game');
      }
    } catch (error) {
      console.error('Load error:', error);
      this.wasLoaded = false;
    }
  }

  resetGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
      this.score = 3;
      this.level = 1;
      this.updateDisplay();
      this.showMessage('Save reset! Game restarted.', 2000);
      console.log('Game reset to defaults');
    } catch (error) {
      this.showMessage('Reset failed!', 2000);
      console.error('Reset error:', error);
    }
  }

  showMessage(message, duration = 2000) {
    this.saveStatusText.setText(message);
    
    // 清除之前的定时器
    if (this.messageTimer) {
      this.messageTimer.remove();
    }
    
    // 设置新的定时器清除消息
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.saveStatusText.setText('');
    });
  }

  update(time, delta) {
    // 本示例不需要持续更新逻辑
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

// 全局访问用于调试
window.game = game;
console.log('Game initialized. Use S/L/SPACE/R keys to interact.');
console.log('Score starts at 3, Level starts at 1');