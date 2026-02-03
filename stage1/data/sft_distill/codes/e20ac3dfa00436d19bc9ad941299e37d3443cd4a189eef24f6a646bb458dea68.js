class SaveLoadScene extends Phaser.Scene {
  constructor() {
    super('SaveLoadScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.moveSpeed = 5;
    
    // 初始化验证信号
    window.__signals__ = {
      playerPosition: { x: 400, y: 300 },
      score: 0,
      saves: [],
      loads: [],
      movements: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（使用Graphics绘制蓝色矩形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'playerTex');
    
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建状态提示文本
    this.statusText = this.add.text(16, 60, 'WASD: Move | S: Save | L: Load', {
      fontSize: '18px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建存档状态显示
    this.saveStatusText = this.add.text(16, 100, 'No save data', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      save: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      load: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
    };

    // 监听保存键（S键，但需要Shift修饰符避免与向下移动冲突）
    this.input.keyboard.on('keydown-S', (event) => {
      if (event.shiftKey) {
        this.saveGame();
      }
    });

    // 监听读取键（L键）
    this.input.keyboard.on('keydown-L', () => {
      this.loadGame();
    });

    // 尝试在启动时检查是否有存档
    this.checkSaveData();

    console.log('[SaveLoadScene] Game started. Use WASD to move, Shift+S to save, L to load.');
  }

  update(time, delta) {
    let moved = false;
    let direction = '';

    // 处理移动输入
    if (this.cursors.left.isDown) {
      this.player.x -= this.moveSpeed;
      moved = true;
      direction = 'left';
    } else if (this.cursors.right.isDown) {
      this.player.x += this.moveSpeed;
      moved = true;
      direction = 'right';
    }

    if (this.cursors.up.isDown) {
      this.player.y -= this.moveSpeed;
      moved = true;
      direction = direction ? direction + '+up' : 'up';
    } else if (this.cursors.down.isDown && !this.input.keyboard.shiftKey) {
      // 只有在没有按Shift时才向下移动（避免与保存冲突）
      this.player.y += this.moveSpeed;
      moved = true;
      direction = direction ? direction + '+down' : 'down';
    }

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 移动时增加分数
    if (moved) {
      this.score += 1;
      this.updateScoreDisplay();
      
      // 记录移动信号
      window.__signals__.movements.push({
        time: time,
        direction: direction,
        position: { x: this.player.x, y: this.player.y },
        score: this.score
      });
      window.__signals__.playerPosition = { x: this.player.x, y: this.player.y };
      window.__signals__.score = this.score;
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  saveGame() {
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaserSaveData', JSON.stringify(saveData));
      this.saveStatusText.setText('Game Saved!');
      this.saveStatusText.setStyle({ fill: '#00ff00' });
      
      // 记录保存信号
      window.__signals__.saves.push({
        ...saveData,
        action: 'save'
      });

      console.log('[SaveGame]', JSON.stringify(saveData));

      // 2秒后恢复提示文本
      this.time.delayedCall(2000, () => {
        this.checkSaveData();
      });
    } catch (error) {
      console.error('Save failed:', error);
      this.saveStatusText.setText('Save Failed!');
      this.saveStatusText.setStyle({ fill: '#ff0000' });
    }
  }

  loadGame() {
    try {
      const savedDataStr = localStorage.getItem('phaserSaveData');
      
      if (!savedDataStr) {
        this.saveStatusText.setText('No save data found!');
        this.saveStatusText.setStyle({ fill: '#ff0000' });
        console.log('[LoadGame] No save data');
        return;
      }

      const saveData = JSON.parse(savedDataStr);
      
      // 恢复玩家状态
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;
      this.score = saveData.score;
      this.updateScoreDisplay();

      this.saveStatusText.setText('Game Loaded!');
      this.saveStatusText.setStyle({ fill: '#00ff00' });

      // 记录读取信号
      window.__signals__.loads.push({
        ...saveData,
        action: 'load'
      });
      window.__signals__.playerPosition = { x: this.player.x, y: this.player.y };
      window.__signals__.score = this.score;

      console.log('[LoadGame]', JSON.stringify(saveData));

      // 2秒后恢复提示文本
      this.time.delayedCall(2000, () => {
        this.checkSaveData();
      });
    } catch (error) {
      console.error('Load failed:', error);
      this.saveStatusText.setText('Load Failed!');
      this.saveStatusText.setStyle({ fill: '#ff0000' });
    }
  }

  checkSaveData() {
    try {
      const savedDataStr = localStorage.getItem('phaserSaveData');
      if (savedDataStr) {
        const saveData = JSON.parse(savedDataStr);
        const date = new Date(saveData.timestamp);
        this.saveStatusText.setText(
          `Last save: ${date.toLocaleTimeString()}`
        );
        this.saveStatusText.setStyle({ fill: '#ffff00' });
      } else {
        this.saveStatusText.setText('No save data');
        this.saveStatusText.setStyle({ fill: '#888888' });
      }
    } catch (error) {
      this.saveStatusText.setText('No save data');
      this.saveStatusText.setStyle({ fill: '#888888' });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: SaveLoadScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);