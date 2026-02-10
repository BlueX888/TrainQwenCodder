class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.instructionText = null;
    this.saveKey = null;
    this.loadKey = null;
    this.cursors = null;
    this.spaceKey = null;
    this.playerSpeed = 200;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 初始化分数
    this.score = 0;

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setDepth(100);

    // 创建状态提示文本
    this.statusText = this.add.text(16, 50, '', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 创建操作说明文本
    this.instructionText = this.add.text(400, 550, 
      'WASD: Move | SPACE: +10 Score | S: Save Game | L: Load Game', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 0.5);
    this.instructionText.setDepth(100);

    // 绘制背景网格
    this.drawGrid();

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 空格键增加分数
    this.spaceKey.on('down', () => {
      this.score += 10;
      this.updateScoreDisplay();
      this.showStatus('Score increased!', 1000);
    });

    // S 键保存游戏（需要同时按住 Ctrl 或单独按 S 但不是移动时）
    this.saveKey.on('down', () => {
      // 避免与移动冲突，检查是否同时按下其他键
      if (!this.cursors.up.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
        this.saveGame();
      }
    });

    // L 键加载游戏
    this.loadKey.on('down', () => {
      this.loadGame();
    });

    // 尝试自动加载之前的存档（可选）
    this.checkForSavedGame();

    // 更新分数显示
    this.updateScoreDisplay();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理移动输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 标准化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  saveGame() {
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save_game', JSON.stringify(saveData));
      this.showStatus('Game Saved!', 2000);
      console.log('Game saved:', saveData);
    } catch (error) {
      this.showStatus('Save Failed!', 2000);
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // 恢复玩家位置
        this.player.setPosition(data.playerX, data.playerY);
        
        // 恢复分数
        this.score = data.score;
        this.updateScoreDisplay();
        
        // 显示加载成功提示
        const date = new Date(data.timestamp);
        this.showStatus(`Game Loaded! (${date.toLocaleTimeString()})`, 2000);
        console.log('Game loaded:', data);
      } else {
        this.showStatus('No Save Found!', 2000);
        console.log('No saved game found');
      }
    } catch (error) {
      this.showStatus('Load Failed!', 2000);
      console.error('Load error:', error);
    }
  }

  checkForSavedGame() {
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      if (savedData) {
        const data = JSON.parse(savedData);
        const date = new Date(data.timestamp);
        this.showStatus(`Save found from ${date.toLocaleTimeString()}. Press L to load.`, 3000);
      }
    } catch (error) {
      console.error('Check save error:', error);
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  showStatus(message, duration) {
    this.statusText.setText(message);
    
    // 清除之前的定时器
    if (this.statusTimer) {
      this.statusTimer.remove();
    }
    
    // 设置新的定时器清除状态文本
    this.statusTimer = this.time.delayedCall(duration, () => {
      this.statusText.setText('');
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);