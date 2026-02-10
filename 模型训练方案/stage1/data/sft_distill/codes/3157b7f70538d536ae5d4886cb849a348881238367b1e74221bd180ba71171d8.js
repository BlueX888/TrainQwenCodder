const SAVE_KEY = 'phaser_game_save';
const DEFAULT_SCORE = 15;
const DEFAULT_LEVEL = 1;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = DEFAULT_SCORE;
    this.level = DEFAULT_LEVEL;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 从localStorage读取存档
    this.loadGame();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI面板
    const panel = this.add.graphics();
    panel.fillStyle(0x16213e, 1);
    panel.fillRect(50, 50, 700, 500);
    panel.lineStyle(3, 0x0f3460, 1);
    panel.strokeRect(50, 50, 700, 500);

    // 标题
    const title = this.add.text(400, 100, '游戏存档系统', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#e94560',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示当前数据
    this.scoreText = this.add.text(400, 200, `分数: ${this.score}`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 260, `等级: ${this.level}`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#00ffff'
    });
    this.levelText.setOrigin(0.5);

    // 存档状态提示
    this.saveStatusText = this.add.text(400, 340, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.saveStatusText.setOrigin(0.5);

    // 操作说明
    const instructions = [
      '操作说明:',
      '[空格] 增加分数 (+10)',
      '[回车] 增加等级 (+1)',
      '[S键] 保存游戏',
      '[R键] 重置数据'
    ];

    let yPos = 400;
    instructions.forEach(text => {
      const instruction = this.add.text(400, yPos, text, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      instruction.setOrigin(0.5);
      yPos += 30;
    });

    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.score += 10;
      this.updateDisplay();
      this.showStatus('分数增加！', 0x00ff00);
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.level += 1;
      this.updateDisplay();
      this.showStatus('等级提升！', 0x00ffff);
    });

    this.input.keyboard.on('keydown-S', () => {
      this.saveGame();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
    });

    // 显示加载提示
    if (this.wasLoaded) {
      this.showStatus('存档已加载！', 0xffff00);
    } else {
      this.showStatus('新游戏开始', 0xffffff);
    }

    // 输出初始状态到控制台（用于验证）
    console.log('=== 游戏初始状态 ===');
    console.log('Score:', this.score);
    console.log('Level:', this.level);
    console.log('===================');
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || DEFAULT_SCORE;
        this.level = data.level || DEFAULT_LEVEL;
        this.wasLoaded = true;
        console.log('存档已加载:', data);
      } else {
        this.score = DEFAULT_SCORE;
        this.level = DEFAULT_LEVEL;
        this.wasLoaded = false;
        console.log('未找到存档，使用默认值');
      }
    } catch (error) {
      console.error('加载存档失败:', error);
      this.score = DEFAULT_SCORE;
      this.level = DEFAULT_LEVEL;
      this.wasLoaded = false;
    }
  }

  saveGame() {
    try {
      const saveData = {
        score: this.score,
        level: this.level,
        timestamp: Date.now()
      };
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this.showStatus('游戏已保存！', 0x00ff00);
      
      console.log('=== 游戏已保存 ===');
      console.log('Score:', this.score);
      console.log('Level:', this.level);
      console.log('Timestamp:', new Date(saveData.timestamp).toLocaleString());
      console.log('==================');
    } catch (error) {
      console.error('保存失败:', error);
      this.showStatus('保存失败！', 0xff0000);
    }
  }

  resetGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
      this.score = DEFAULT_SCORE;
      this.level = DEFAULT_LEVEL;
      this.updateDisplay();
      this.showStatus('数据已重置！', 0xff6600);
      
      console.log('=== 数据已重置 ===');
      console.log('Score:', this.score);
      console.log('Level:', this.level);
      console.log('==================');
    } catch (error) {
      console.error('重置失败:', error);
      this.showStatus('重置失败！', 0xff0000);
    }
  }

  updateDisplay() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
  }

  showStatus(message, color) {
    this.saveStatusText.setText(message);
    this.saveStatusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后清除提示
    this.time.delayedCall(2000, () => {
      this.saveStatusText.setText('');
    });
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 全局访问游戏状态（用于调试和验证）
window.getGameState = function() {
  const scene = game.scene.getScene('GameScene');
  if (scene) {
    return {
      score: scene.score,
      level: scene.level,
      savedData: localStorage.getItem(SAVE_KEY)
    };
  }
  return null;
};

console.log('游戏已启动！使用 window.getGameState() 查看当前状态');