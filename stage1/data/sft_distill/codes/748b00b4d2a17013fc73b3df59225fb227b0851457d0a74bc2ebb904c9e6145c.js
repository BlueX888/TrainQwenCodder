// 全局信号记录
window.__signals__ = {
  saves: [],
  loads: [],
  movements: [],
  currentState: null
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.moveSpeed = 200;
    this.scoreText = null;
    this.positionText = null;
    this.statusText = null;
    this.saveKey = null;
    this.loadKey = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（绿色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.player.setDepth(10);

    // 创建收集物（黄色圆点）
    this.createCollectibles();

    // 创建UI文本
    this.scoreText = this.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.positionText = this.add.text(10, 50, 'Position: (400, 300)', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(10, 90, 'Status: Ready', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 操作提示
    this.add.text(10, 550, 'Controls: WASD - Move | S - Save | L - Load', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 存档和读档键
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听存档键（需要同时按Shift+S来避免与移动冲突）
    this.input.keyboard.on('keydown-S', (event) => {
      if (event.shiftKey) {
        this.saveGame();
      }
    });

    // 监听读档键
    this.input.keyboard.on('keydown-L', () => {
      this.loadGame();
    });

    // 尝试自动加载存档
    this.autoLoadGame();

    // 初始化信号
    this.updateSignals();

    console.log('Game started. Use WASD to move, Shift+S to save, L to load.');
  }

  createCollectibles() {
    // 创建一些可收集的黄色圆点
    this.collectibles = this.add.group();
    
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('collectible', 20, 20);
    graphics.destroy();

    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 400, y: 100 },
      { x: 100, y: 300 },
      { x: 700, y: 300 }
    ];

    positions.forEach(pos => {
      const collectible = this.add.sprite(pos.x, pos.y, 'collectible');
      collectible.setData('collected', false);
      this.collectibles.add(collectible);
    });
  }

  update(time, delta) {
    if (!this.player) return;

    let moved = false;
    const speed = this.moveSpeed * (delta / 1000);

    // WASD移动控制
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
    } else if (this.cursors.down.isDown && !this.cursors.down.shiftKey) {
      // 只有在不按Shift时才向下移动（避免与保存冲突）
      this.player.y += speed;
      moved = true;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 检测收集物碰撞
    this.collectibles.children.entries.forEach(collectible => {
      if (!collectible.getData('collected')) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          collectible.x, collectible.y
        );
        
        if (distance < 30) {
          collectible.setData('collected', true);
          collectible.setAlpha(0.3);
          this.score += 10;
          this.updateScore();
          
          window.__signals__.movements.push({
            type: 'collect',
            position: { x: collectible.x, y: collectible.y },
            score: this.score,
            timestamp: Date.now()
          });
        }
      }
    });

    // 如果移动了，记录移动信号
    if (moved) {
      this.recordMovement();
    }

    // 更新位置显示
    this.updatePosition();
  }

  recordMovement() {
    const now = Date.now();
    // 限制记录频率（每100ms记录一次）
    if (!this.lastMoveRecord || now - this.lastMoveRecord > 100) {
      this.lastMoveRecord = now;
      window.__signals__.movements.push({
        type: 'move',
        position: { 
          x: Math.round(this.player.x), 
          y: Math.round(this.player.y) 
        },
        timestamp: now
      });
    }
  }

  saveGame() {
    // 收集所有收集物状态
    const collectiblesState = [];
    this.collectibles.children.entries.forEach((collectible, index) => {
      collectiblesState.push({
        index: index,
        collected: collectible.getData('collected')
      });
    });

    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      collectibles: collectiblesState,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save', JSON.stringify(saveData));
      
      this.showStatus('Game Saved!', '#00ff00');
      
      // 记录保存信号
      window.__signals__.saves.push({
        data: saveData,
        timestamp: Date.now()
      });
      
      this.updateSignals();
      
      console.log('Game saved:', saveData);
    } catch (error) {
      this.showStatus('Save Failed!', '#ff0000');
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const saveDataStr = localStorage.getItem('phaser_save');
      
      if (!saveDataStr) {
        this.showStatus('No Save Found!', '#ff0000');
        console.log('No save data found');
        return;
      }

      const saveData = JSON.parse(saveDataStr);
      
      // 恢复玩家位置
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;
      
      // 恢复分数
      this.score = saveData.score;
      this.updateScore();
      
      // 恢复收集物状态
      if (saveData.collectibles) {
        saveData.collectibles.forEach(state => {
          const collectible = this.collectibles.children.entries[state.index];
          if (collectible) {
            collectible.setData('collected', state.collected);
            collectible.setAlpha(state.collected ? 0.3 : 1);
          }
        });
      }
      
      this.showStatus('Game Loaded!', '#00ff00');
      
      // 记录读取信号
      window.__signals__.loads.push({
        data: saveData,
        timestamp: Date.now()
      });
      
      this.updateSignals();
      this.updatePosition();
      
      console.log('Game loaded:', saveData);
    } catch (error) {
      this.showStatus('Load Failed!', '#ff0000');
      console.error('Load error:', error);
    }
  }

  autoLoadGame() {
    // 游戏启动时自动尝试加载存档
    const saveDataStr = localStorage.getItem('phaser_save');
    if (saveDataStr) {
      console.log('Auto-loading previous save...');
      this.loadGame();
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updatePosition() {
    const x = Math.round(this.player.x);
    const y = Math.round(this.player.y);
    this.positionText.setText(`Position: (${x}, ${y})`);
  }

  showStatus(message, color) {
    this.statusText.setText(`Status: ${message}`);
    this.statusText.setFill(color);
    
    // 3秒后恢复默认状态
    this.time.delayedCall(3000, () => {
      this.statusText.setText('Status: Ready');
      this.statusText.setFill('#00ff00');
    });
  }

  updateSignals() {
    window.__signals__.currentState = {
      position: { 
        x: Math.round(this.player.x), 
        y: Math.round(this.player.y) 
      },
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
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('Signals available at window.__signals__');
console.log('Initial state:', window.__signals__);