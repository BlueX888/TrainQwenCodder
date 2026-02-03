// 存档管理器类
class SaveManager {
  constructor(saveKey = 'phaser_game_save') {
    this.saveKey = saveKey;
  }

  // 保存游戏数据
  save(data) {
    try {
      const saveData = JSON.stringify(data);
      localStorage.setItem(this.saveKey, saveData);
      console.log('Game saved:', data);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  // 加载游戏数据
  load() {
    try {
      const saveData = localStorage.getItem(this.saveKey);
      if (saveData) {
        const data = JSON.parse(saveData);
        console.log('Game loaded:', data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  // 清除存档
  clear() {
    try {
      localStorage.removeItem(this.saveKey);
      console.log('Save cleared');
      return true;
    } catch (error) {
      console.error('Clear failed:', error);
      return false;
    }
  }

  // 检查是否存在存档
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }
}

// 游戏主场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // 游戏状态
    this.score = 3; // 初始分数为3
    this.level = 1; // 初始等级为1
    
    // 存档管理器
    this.saveManager = new SaveManager('phaser_game_save_v1');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 尝试加载存档
    this.loadGame();

    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 绘制主面板
    const panel = this.add.graphics();
    panel.fillStyle(0x16213e, 1);
    panel.fillRoundedRect(width / 2 - 200, 100, 400, 250, 16);
    panel.lineStyle(3, 0x0f3460, 1);
    panel.strokeRoundedRect(width / 2 - 200, 100, 400, 250, 16);

    // 标题
    this.add.text(width / 2, 130, '游戏存档系统', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#e94560',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 分数显示
    this.scoreText = this.add.text(width / 2, 200, `分数: ${this.score}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00d9ff'
    }).setOrigin(0.5);

    // 等级显示
    this.levelText = this.add.text(width / 2, 240, `等级: ${this.level}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ff88'
    }).setOrigin(0.5);

    // 存档状态提示
    this.statusText = this.add.text(width / 2, 300, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffaa00'
    }).setOrigin(0.5);

    // 绘制操作提示面板
    const hintPanel = this.add.graphics();
    hintPanel.fillStyle(0x16213e, 1);
    hintPanel.fillRoundedRect(width / 2 - 300, 380, 600, 180, 12);
    hintPanel.lineStyle(2, 0x0f3460, 1);
    hintPanel.strokeRoundedRect(width / 2 - 300, 380, 600, 180, 12);

    // 操作提示
    const hints = [
      '操作说明:',
      '[空格] 增加分数  [回车] 升级',
      '[S] 手动保存  [L] 手动加载  [R] 重置存档',
      '(数据变化时会自动保存)'
    ];

    hints.forEach((hint, index) => {
      const style = index === 0 ? 
        { fontSize: '20px', color: '#e94560', fontStyle: 'bold' } :
        { fontSize: '16px', color: '#ffffff' };
      
      this.add.text(width / 2, 400 + index * 35, hint, {
        ...style,
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });

    // 键盘输入
    this.setupInput();

    // 显示加载状态
    if (this.saveManager.hasSave()) {
      this.showStatus('已加载存档数据', 0x00ff88);
    } else {
      this.showStatus('新游戏开始 (初始分数: 3)', 0xffaa00);
    }
  }

  setupInput() {
    // 空格键 - 增加分数
    this.input.keyboard.on('keydown-SPACE', () => {
      this.score += 10;
      this.updateDisplay();
      this.autoSave();
      this.showStatus('分数 +10', 0x00d9ff);
    });

    // 回车键 - 升级
    this.input.keyboard.on('keydown-ENTER', () => {
      this.level += 1;
      this.updateDisplay();
      this.autoSave();
      this.showStatus('等级提升!', 0x00ff88);
    });

    // S键 - 手动保存
    this.input.keyboard.on('keydown-S', () => {
      const success = this.saveGame();
      if (success) {
        this.showStatus('手动保存成功!', 0x00ff88);
      } else {
        this.showStatus('保存失败!', 0xff0000);
      }
    });

    // L键 - 手动加载
    this.input.keyboard.on('keydown-L', () => {
      const success = this.loadGame();
      if (success) {
        this.updateDisplay();
        this.showStatus('手动加载成功!', 0x00ff88);
      } else {
        this.showStatus('无存档数据!', 0xff0000);
      }
    });

    // R键 - 重置存档
    this.input.keyboard.on('keydown-R', () => {
      this.resetGame();
      this.updateDisplay();
      this.showStatus('存档已重置!', 0xffaa00);
    });
  }

  // 保存游戏
  saveGame() {
    const saveData = {
      score: this.score,
      level: this.level,
      timestamp: Date.now()
    };
    return this.saveManager.save(saveData);
  }

  // 加载游戏
  loadGame() {
    const saveData = this.saveManager.load();
    if (saveData) {
      this.score = saveData.score !== undefined ? saveData.score : 3;
      this.level = saveData.level !== undefined ? saveData.level : 1;
      return true;
    }
    return false;
  }

  // 重置游戏
  resetGame() {
    this.score = 3; // 重置为初始分数3
    this.level = 1;
    this.saveManager.clear();
  }

  // 自动保存
  autoSave() {
    this.saveGame();
  }

  // 更新显示
  updateDisplay() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.levelText.setText(`等级: ${this.level}`);
  }

  // 显示状态消息
  showStatus(message, color = 0xffaa00) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 清除之前的定时器
    if (this.statusTimer) {
      this.statusTimer.remove();
    }
    
    // 3秒后清除消息
    this.statusTimer = this.time.delayedCall(3000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    // 可以在这里添加游戏逻辑
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

// 在控制台输出初始状态用于验证
console.log('=== Phaser3 存档系统演示 ===');
console.log('初始分数: 3');
console.log('初始等级: 1');
console.log('存档键名: phaser_game_save_v1');
console.log('===========================');