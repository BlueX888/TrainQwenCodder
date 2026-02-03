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
    this.playerSpeed = 200;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      score: 0,
      playerX: 400,
      playerY: 300,
      lastAction: 'init',
      saveData: null,
      timestamp: Date.now()
    };

    // 创建玩家纹理（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5);

    // 初始分数
    this.score = 0;

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态提示文本
    this.statusText = this.add.text(16, 60, 'Use Arrow Keys to move\nPress S to SAVE\nPress L to LOAD', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建存档信息文本
    this.saveInfoText = this.add.text(16, 150, 'No save data', {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作反馈文本
    this.feedbackText = this.add.text(400, 500, '', {
      fontSize: '20px',
      color: '#ff00ff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.feedbackText.setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听保存键
    this.saveKey.on('down', () => {
      this.saveGame();
    });

    // 监听加载键
    this.loadKey.on('down', () => {
      this.loadGame();
    });

    // 尝试检查是否有存档
    this.checkSaveData();

    // 创建边界（视觉提示）
    const boundary = this.add.graphics();
    boundary.lineStyle(2, 0xffffff, 0.5);
    boundary.strokeRect(50, 50, 700, 500);

    console.log('[INIT] Game started', window.__signals__);
  }

  update(time, delta) {
    // 玩家移动
    let moved = false;
    const speed = this.playerSpeed * (delta / 1000);

    if (this.cursors.left.isDown) {
      this.player.x -= speed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
      moved = true;
    }

    // 限制玩家在边界内
    this.player.x = Phaser.Math.Clamp(this.player.x, 70, 730);
    this.player.y = Phaser.Math.Clamp(this.player.y, 70, 530);

    // 移动时增加分数
    if (moved) {
      this.score += 1;
      this.updateScore();
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.score = this.score;
  }

  updateScore() {
    this.scoreText.setText('Score: ' + this.score);
  }

  saveGame() {
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now()
    };

    // 保存到localStorage
    try {
      localStorage.setItem('phaser_save_game', JSON.stringify(saveData));
      
      // 显示反馈
      this.showFeedback('GAME SAVED!', 0x00ff00);
      
      // 更新存档信息显示
      this.updateSaveInfo(saveData);
      
      // 更新信号
      window.__signals__.lastAction = 'save';
      window.__signals__.saveData = saveData;
      window.__signals__.timestamp = Date.now();
      
      console.log('[SAVE] Game saved:', saveData);
    } catch (e) {
      this.showFeedback('SAVE FAILED!', 0xff0000);
      console.error('[SAVE ERROR]', e);
    }
  }

  loadGame() {
    try {
      const savedDataStr = localStorage.getItem('phaser_save_game');
      
      if (!savedDataStr) {
        this.showFeedback('NO SAVE DATA!', 0xff0000);
        console.log('[LOAD] No save data found');
        return;
      }

      const saveData = JSON.parse(savedDataStr);
      
      // 恢复玩家位置和分数
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;
      this.score = saveData.score;
      this.updateScore();
      
      // 显示反馈
      this.showFeedback('GAME LOADED!', 0x00ffff);
      
      // 更新信号
      window.__signals__.lastAction = 'load';
      window.__signals__.playerX = Math.round(saveData.playerX);
      window.__signals__.playerY = Math.round(saveData.playerY);
      window.__signals__.score = saveData.score;
      window.__signals__.timestamp = Date.now();
      
      console.log('[LOAD] Game loaded:', saveData);
    } catch (e) {
      this.showFeedback('LOAD FAILED!', 0xff0000);
      console.error('[LOAD ERROR]', e);
    }
  }

  checkSaveData() {
    try {
      const savedDataStr = localStorage.getItem('phaser_save_game');
      if (savedDataStr) {
        const saveData = JSON.parse(savedDataStr);
        this.updateSaveInfo(saveData);
      }
    } catch (e) {
      console.error('[CHECK SAVE ERROR]', e);
    }
  }

  updateSaveInfo(saveData) {
    const date = new Date(saveData.timestamp);
    const timeStr = date.toLocaleTimeString();
    this.saveInfoText.setText(
      `Last Save:\nX: ${Math.round(saveData.playerX)}, Y: ${Math.round(saveData.playerY)}\nScore: ${saveData.score}\nTime: ${timeStr}`
    );
  }

  showFeedback(message, color) {
    this.feedbackText.setText(message);
    this.feedbackText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 2秒后清除反馈
    this.time.delayedCall(2000, () => {
      this.feedbackText.setText('');
    });
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

// 启动游戏
const game = new Phaser.Game(config);

// 导出信号用于测试验证
console.log('[GAME] Save/Load system initialized. Signals available at window.__signals__');