// 存档系统游戏
class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super('SaveLoadScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
    this.moveSpeed = 200;
    
    // 初始化信号系统
    if (!window.__signals__) {
      window.__signals__ = [];
    }
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录初始化信号
    this.emitSignal('scene_created', { timestamp: Date.now() });

    // 创建玩家（使用 Graphics 绘制蓝色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'playerTex');
    this.player.setOrigin(0.5);

    // 初始化分数
    this.score = 0;

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建状态提示文本
    this.statusText = this.add.text(16, 50, 'Arrow Keys: Move | S: Save | L: Load', {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建存档提示文本
    this.saveInfoText = this.add.text(16, 80, '', {
      fontSize: '16px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听保存键
    this.saveKey.on('down', () => {
      this.saveGame();
    });

    // 监听读取键
    this.loadKey.on('down', () => {
      this.loadGame();
    });

    // 尝试加载之前的存档（如果存在）
    this.checkSaveExists();

    // 记录初始状态
    this.emitSignal('initial_state', {
      x: this.player.x,
      y: this.player.y,
      score: this.score
    });
  }

  update(time, delta) {
    // 玩家移动逻辑
    let moved = false;
    const moveDistance = this.moveSpeed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= moveDistance;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += moveDistance;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= moveDistance;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += moveDistance;
      moved = true;
    }

    // 限制玩家在屏幕范围内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 移动时增加分数
    if (moved) {
      this.score += Math.floor(moveDistance / 10);
      this.updateScoreDisplay();
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText('Score: ' + this.score);
  }

  saveGame() {
    const saveData = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      score: this.score,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save_game', JSON.stringify(saveData));
      this.saveInfoText.setText('Game Saved!');
      this.saveInfoText.setColor('#00ff00');
      
      // 记录保存信号
      this.emitSignal('game_saved', saveData);

      // 2秒后清除提示
      this.time.delayedCall(2000, () => {
        this.saveInfoText.setText('');
      });

      console.log('Game saved:', saveData);
    } catch (e) {
      this.saveInfoText.setText('Save Failed!');
      this.saveInfoText.setColor('#ff0000');
      console.error('Save error:', e);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      
      if (savedData) {
        const saveData = JSON.parse(savedData);
        
        // 恢复玩家位置
        this.player.x = saveData.x;
        this.player.y = saveData.y;
        
        // 恢复分数
        this.score = saveData.score;
        this.updateScoreDisplay();
        
        this.saveInfoText.setText('Game Loaded!');
        this.saveInfoText.setColor('#00ffff');
        
        // 记录加载信号
        this.emitSignal('game_loaded', saveData);

        // 2秒后清除提示
        this.time.delayedCall(2000, () => {
          this.saveInfoText.setText('');
        });

        console.log('Game loaded:', saveData);
      } else {
        this.saveInfoText.setText('No Save Found!');
        this.saveInfoText.setColor('#ff9900');
        
        this.emitSignal('load_failed', { reason: 'no_save_data' });

        this.time.delayedCall(2000, () => {
          this.saveInfoText.setText('');
        });
      }
    } catch (e) {
      this.saveInfoText.setText('Load Failed!');
      this.saveInfoText.setColor('#ff0000');
      console.error('Load error:', e);
      
      this.emitSignal('load_failed', { reason: 'parse_error', error: e.message });
    }
  }

  checkSaveExists() {
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      if (savedData) {
        const saveData = JSON.parse(savedData);
        const date = new Date(saveData.timestamp);
        this.saveInfoText.setText(`Last save: ${date.toLocaleTimeString()}`);
        this.saveInfoText.setColor('#aaaaaa');
        
        this.emitSignal('save_exists', { timestamp: saveData.timestamp });
      }
    } catch (e) {
      console.error('Check save error:', e);
    }
  }

  emitSignal(type, data) {
    const signal = {
      type: type,
      data: data,
      timestamp: Date.now()
    };
    window.__signals__.push(signal);
    console.log('Signal:', JSON.stringify(signal));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SaveLoadScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例和信号用于测试
window.__game__ = game;
window.__getState__ = function() {
  const scene = game.scene.scenes[0];
  return {
    playerX: Math.round(scene.player.x),
    playerY: Math.round(scene.player.y),
    score: scene.score,
    signals: window.__signals__
  };
};

// 清除存档的辅助函数（用于测试）
window.__clearSave__ = function() {
  localStorage.removeItem('phaser_save_game');
  console.log('Save cleared');
};