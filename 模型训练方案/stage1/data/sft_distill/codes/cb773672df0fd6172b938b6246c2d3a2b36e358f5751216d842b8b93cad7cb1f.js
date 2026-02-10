// 完整的 Phaser3 存档系统实现
class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super('SaveLoadScene');
    this.score = 12;
    this.level = 1;
    this.SAVE_KEY = 'phaser_game_save';
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 从 localStorage 加载存档数据
    this.loadGameData();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const title = this.add.text(400, 50, 'Phaser3 存档系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建信息面板背景
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x16213e, 1);
    panelBg.fillRoundedRect(200, 120, 400, 180, 10);
    panelBg.lineStyle(2, 0x0f3460, 1);
    panelBg.strokeRoundedRect(200, 120, 400, 180, 10);

    // 显示当前数据
    this.scoreText = this.add.text(400, 160, `Score: ${this.score}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.scoreText.setOrigin(0.5);

    this.levelText = this.add.text(400, 210, `Level: ${this.level}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00aaff',
      fontStyle: 'bold'
    });
    this.levelText.setOrigin(0.5);

    // 状态指示器
    this.statusText = this.add.text(400, 260, '准备就绪', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffaa00'
    });
    this.statusText.setOrigin(0.5);

    // 创建操作说明面板
    const instructionBg = this.add.graphics();
    instructionBg.fillStyle(0x16213e, 1);
    instructionBg.fillRoundedRect(150, 330, 500, 220, 10);
    instructionBg.lineStyle(2, 0x0f3460, 1);
    instructionBg.strokeRoundedRect(150, 330, 500, 220, 10);

    const instructions = [
      '操作说明:',
      '',
      'SPACE - 增加分数 (+10)',
      'ENTER - 增加等级 (+1)',
      'S - 保存游戏数据',
      'R - 重置数据 (score=12, level=1)',
      'C - 清除存档'
    ];

    instructions.forEach((text, index) => {
      const style = index === 0 ? 
        { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' } :
        { fontSize: '16px', color: '#cccccc' };
      
      this.add.text(180, 345 + index * 28, text, {
        fontFamily: 'Arial',
        ...style
      });
    });

    // 设置键盘输入
    this.setupInputs();

    // 显示初始加载信息
    this.showStatus('数据已加载', 0x00ff00);
  }

  setupInputs() {
    // 空格键：增加分数
    this.input.keyboard.on('keydown-SPACE', () => {
      this.score += 10;
      this.updateDisplay();
      this.showStatus('分数 +10', 0x00ff00);
    });

    // 回车键：增加等级
    this.input.keyboard.on('keydown-ENTER', () => {
      this.level += 1;
      this.updateDisplay();
      this.showStatus('等级 +1', 0x00aaff);
    });

    // S键：保存数据
    this.input.keyboard.on('keydown-S', () => {
      this.saveGameData();
    });

    // R键：重置数据
    this.input.keyboard.on('keydown-R', () => {
      this.resetGameData();
    });

    // C键：清除存档
    this.input.keyboard.on('keydown-C', () => {
      this.clearSaveData();
    });
  }

  loadGameData() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score !== undefined ? data.score : 12;
        this.level = data.level !== undefined ? data.level : 1;
        console.log('存档已加载:', data);
      } else {
        // 没有存档，使用默认值
        this.score = 12;
        this.level = 1;
        console.log('未找到存档，使用默认值');
      }
    } catch (error) {
      console.error('加载存档失败:', error);
      this.score = 12;
      this.level = 1;
    }
  }

  saveGameData() {
    try {
      const saveData = {
        score: this.score,
        level: this.level,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      console.log('游戏已保存:', saveData);
      this.showStatus('保存成功！', 0x00ff00);
    } catch (error) {
      console.error('保存失败:', error);
      this.showStatus('保存失败！', 0xff0000);
    }
  }

  resetGameData() {
    this.score = 12;
    this.level = 1;
    this.updateDisplay();
    this.showStatus('数据已重置', 0xffaa00);
    console.log('数据已重置为默认值');
  }

  clearSaveData() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      this.resetGameData();
      this.showStatus('存档已清除', 0xff6600);
      console.log('存档已从 localStorage 清除');
    } catch (error) {
      console.error('清除存档失败:', error);
      this.showStatus('清除失败！', 0xff0000);
    }
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.levelText.setText(`Level: ${this.level}`);
  }

  showStatus(message, color = 0xffaa00) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后恢复默认状态
    this.time.delayedCall(2000, () => {
      this.statusText.setText('准备就绪');
      this.statusText.setColor('#ffaa00');
    });
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
  scene: SaveLoadScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    level: scene.level,
    savedData: localStorage.getItem(scene.SAVE_KEY)
  };
};

// 控制台提示
console.log('=== Phaser3 存档系统已启动 ===');
console.log('使用 window.getGameState() 查看当前状态');
console.log('初始值: score=12, level=1');