// 存档系统：保存和读取玩家位置与分数
class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super('SaveLoadScene');
    this.player = null;
    this.playerX = 400;
    this.playerY = 300;
    this.score = 0;
    this.moveSpeed = 5;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
    this.statusText = null;
    this.scoreText = null;
    this.positionText = null;
    this.hintText = null;
    this.feedbackText = null;
    this.feedbackTimer = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      saves: [],
      loads: [],
      movements: [],
      currentState: {}
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家（使用 Graphics 绘制一个方块）
    this.createPlayer();

    // 创建 UI 文本
    this.createUI();

    // 设置键盘输入
    this.setupInput();

    // 尝试从 localStorage 加载初始状态（如果存在）
    this.tryLoadInitialState();

    // 更新显示
    this.updateDisplay();

    // 记录初始状态
    this.recordCurrentState();
  }

  createPlayer() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(this.playerX, this.playerY, 'player');
    this.player.setOrigin(0.5);
  }

  createUI() {
    // 标题
    this.add.text(400, 30, 'Save/Load System Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 分数显示
    this.scoreText = this.add.text(20, 80, '', {
      fontSize: '24px',
      color: '#ffff00'
    });

    // 位置显示
    this.positionText = this.add.text(20, 120, '', {
      fontSize: '24px',
      color: '#00ffff'
    });

    // 操作提示
    this.hintText = this.add.text(400, 550, 
      'Arrow Keys: Move (+10 score) | S: Save | L: Load', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 反馈信息（保存/加载提示）
    this.feedbackText = this.add.text(400, 500, '', {
      fontSize: '24px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 存档状态显示
    this.statusText = this.add.text(20, 160, '', {
      fontSize: '18px',
      color: '#ff9900'
    });
  }

  setupInput() {
    // 方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // S 键保存
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.saveKey.on('down', () => this.saveGame());

    // L 键加载
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.loadKey.on('down', () => this.loadGame());
  }

  tryLoadInitialState() {
    try {
      const savedData = localStorage.getItem('phaser_save_data');
      if (savedData) {
        this.statusText.setText('Save file detected! Press L to load.');
      } else {
        this.statusText.setText('No save file found. Play and press S to save!');
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
      this.statusText.setText('Save system unavailable (localStorage disabled)');
    }
  }

  saveGame() {
    const saveData = {
      x: this.playerX,
      y: this.playerY,
      score: this.score,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save_data', JSON.stringify(saveData));
      this.showFeedback('Game Saved!', 0x00ff00);
      
      // 记录保存信号
      window.__signals__.saves.push({
        timestamp: saveData.timestamp,
        data: { ...saveData }
      });

      this.statusText.setText(`Last Save: ${new Date(saveData.timestamp).toLocaleTimeString()}`);
      
      console.log('SAVE:', saveData);
    } catch (e) {
      console.error('Save failed:', e);
      this.showFeedback('Save Failed!', 0xff0000);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem('phaser_save_data');
      
      if (!savedData) {
        this.showFeedback('No Save Found!', 0xff0000);
        return;
      }

      const data = JSON.parse(savedData);
      
      // 恢复状态
      this.playerX = data.x;
      this.playerY = data.y;
      this.score = data.score;
      
      // 更新玩家位置
      this.player.setPosition(this.playerX, this.playerY);
      
      // 显示反馈
      this.showFeedback('Game Loaded!', 0x00ffff);
      
      // 记录加载信号
      window.__signals__.loads.push({
        timestamp: Date.now(),
        data: { ...data }
      });

      this.statusText.setText(`Loaded from: ${new Date(data.timestamp).toLocaleTimeString()}`);
      
      // 更新显示
      this.updateDisplay();
      
      // 记录当前状态
      this.recordCurrentState();
      
      console.log('LOAD:', data);
    } catch (e) {
      console.error('Load failed:', e);
      this.showFeedback('Load Failed!', 0xff0000);
    }
  }

  showFeedback(message, color) {
    this.feedbackText.setText(message);
    this.feedbackText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 清除之前的定时器
    if (this.feedbackTimer) {
      this.feedbackTimer.remove();
    }
    
    // 2秒后清除反馈信息
    this.feedbackTimer = this.time.delayedCall(2000, () => {
      this.feedbackText.setText('');
    });
  }

  update() {
    let moved = false;
    let direction = '';

    // 处理方向键移动
    if (this.cursors.left.isDown) {
      this.playerX -= this.moveSpeed;
      moved = true;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      this.playerX += this.moveSpeed;
      moved = true;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      this.playerY -= this.moveSpeed;
      moved = true;
      direction = direction ? direction + '+up' : 'up';
    } else if (this.cursors.down.isDown) {
      this.playerY += this.moveSpeed;
      moved = true;
      direction = direction ? direction + '+down' : 'down';
    }

    // 边界限制
    this.playerX = Phaser.Math.Clamp(this.playerX, 20, 780);
    this.playerY = Phaser.Math.Clamp(this.playerY, 20, 480);

    // 更新玩家位置
    this.player.setPosition(this.playerX, this.playerY);

    // 移动时增加分数
    if (moved) {
      this.score += 10;
      
      // 记录移动信号
      window.__signals__.movements.push({
        timestamp: Date.now(),
        direction: direction,
        position: { x: this.playerX, y: this.playerY },
        score: this.score
      });
    }

    // 更新显示
    this.updateDisplay();

    // 记录当前状态
    if (moved) {
      this.recordCurrentState();
    }
  }

  updateDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.positionText.setText(`Position: (${Math.round(this.playerX)}, ${Math.round(this.playerY)})`);
  }

  recordCurrentState() {
    window.__signals__.currentState = {
      x: Math.round(this.playerX),
      y: Math.round(this.playerY),
      score: this.score,
      timestamp: Date.now()
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: SaveLoadScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证信号
console.log('Save/Load System initialized. Signals available at window.__signals__');