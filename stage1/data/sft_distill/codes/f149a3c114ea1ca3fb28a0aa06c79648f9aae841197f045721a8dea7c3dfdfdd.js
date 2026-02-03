// 存档系统游戏
class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super('SaveLoadScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.keys = {};
    this.moveSpeed = 200;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      playerPosition: { x: 400, y: 300 },
      score: 0,
      lastAction: 'init',
      saveData: null,
      loadData: null
    };

    // 创建玩家（使用Graphics绘制正方形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-20, -20, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态提示文本
    this.statusText = this.add.text(16, 50, 'WASD: Move | S: Save | L: Load', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建存档状态显示
    this.saveStatusText = this.add.text(16, 80, 'No save data', {
      fontSize: '16px',
      fill: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keys.L = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听S键保存
    this.keys.S.on('down', () => {
      this.saveGame();
    });

    // 监听L键加载
    this.keys.L.on('down', () => {
      this.loadGame();
    });

    // 尝试加载已有存档显示
    this.checkExistingSave();

    console.log('[Game] Initialized - Use WASD to move, S to save, L to load');
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;
    let moved = false;

    // WASD移动控制
    if (this.keys.W.isDown) {
      this.player.y -= this.moveSpeed * deltaSeconds;
      moved = true;
    }
    if (this.keys.S.isDown && !Phaser.Input.Keyboard.JustDown(this.keys.S)) {
      this.player.y += this.moveSpeed * deltaSeconds;
      moved = true;
    }
    if (this.keys.A.isDown) {
      this.player.x -= this.moveSpeed * deltaSeconds;
      moved = true;
    }
    if (this.keys.D.isDown) {
      this.player.x += this.moveSpeed * deltaSeconds;
      moved = true;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 移动时增加分数
    if (moved) {
      this.score += Math.floor(delta / 10);
      this.updateScoreDisplay();
    }

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.score = this.score;
  }

  saveGame() {
    const saveData = {
      x: this.player.x,
      y: this.player.y,
      score: this.score,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save_data', JSON.stringify(saveData));
      
      this.statusText.setText('Game Saved!');
      this.statusText.setStyle({ fill: '#00ff00' });
      
      this.saveStatusText.setText(
        `Saved: Pos(${Math.round(saveData.x)}, ${Math.round(saveData.y)}) Score: ${saveData.score}`
      );
      this.saveStatusText.setStyle({ fill: '#00ff00' });

      window.__signals__.lastAction = 'save';
      window.__signals__.saveData = saveData;

      console.log('[Save] Game saved:', saveData);

      // 恢复提示文本
      this.time.delayedCall(2000, () => {
        this.statusText.setText('WASD: Move | S: Save | L: Load');
        this.statusText.setStyle({ fill: '#ffff00' });
      });
    } catch (error) {
      console.error('[Save] Failed to save:', error);
      this.statusText.setText('Save Failed!');
      this.statusText.setStyle({ fill: '#ff0000' });
    }
  }

  loadGame() {
    try {
      const savedDataString = localStorage.getItem('phaser_save_data');
      
      if (!savedDataString) {
        this.statusText.setText('No Save Found!');
        this.statusText.setStyle({ fill: '#ff0000' });
        
        console.log('[Load] No save data found');
        
        this.time.delayedCall(2000, () => {
          this.statusText.setText('WASD: Move | S: Save | L: Load');
          this.statusText.setStyle({ fill: '#ffff00' });
        });
        return;
      }

      const saveData = JSON.parse(savedDataString);
      
      // 恢复玩家状态
      this.player.x = saveData.x;
      this.player.y = saveData.y;
      this.score = saveData.score;
      
      this.updateScoreDisplay();
      
      this.statusText.setText('Game Loaded!');
      this.statusText.setStyle({ fill: '#00ff00' });

      window.__signals__.lastAction = 'load';
      window.__signals__.loadData = saveData;
      window.__signals__.playerPosition = {
        x: Math.round(saveData.x),
        y: Math.round(saveData.y)
      };
      window.__signals__.score = this.score;

      console.log('[Load] Game loaded:', saveData);

      // 恢复提示文本
      this.time.delayedCall(2000, () => {
        this.statusText.setText('WASD: Move | S: Save | L: Load');
        this.statusText.setStyle({ fill: '#ffff00' });
      });
    } catch (error) {
      console.error('[Load] Failed to load:', error);
      this.statusText.setText('Load Failed!');
      this.statusText.setStyle({ fill: '#ff0000' });
    }
  }

  checkExistingSave() {
    try {
      const savedDataString = localStorage.getItem('phaser_save_data');
      if (savedDataString) {
        const saveData = JSON.parse(savedDataString);
        this.saveStatusText.setText(
          `Saved: Pos(${Math.round(saveData.x)}, ${Math.round(saveData.y)}) Score: ${saveData.score}`
        );
        this.saveStatusText.setStyle({ fill: '#aaaaaa' });
      }
    } catch (error) {
      console.error('[Check] Error checking save:', error);
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: SaveLoadScene,
  parent: document.body
};

// 启动游戏
const game = new Phaser.Game(config);

console.log('[System] Save/Load game initialized');
console.log('[System] Controls: WASD to move, S to save, L to load');