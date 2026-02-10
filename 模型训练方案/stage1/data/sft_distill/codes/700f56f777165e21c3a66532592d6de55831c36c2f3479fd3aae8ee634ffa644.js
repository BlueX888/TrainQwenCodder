class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.coins = null;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
    this.playerSpeed = 200;
  }

  preload() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(12, 12, 12);
    coinGraphics.lineStyle(2, 0xffaa00, 1);
    coinGraphics.strokeCircle(12, 12, 12);
    coinGraphics.generateTexture('coin', 24, 24);
    coinGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setDepth(10);

    // 创建金币组
    this.coins = this.add.group();
    this.spawnCoins();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setDepth(20);

    // 创建状态提示文本
    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.statusText.setDepth(20);

    // 创建操作说明
    const instructions = this.add.text(16, 560, 
      'Arrow Keys: Move | S: Save | L: Load | Collect yellow coins!', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    instructions.setDepth(20);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听保存和加载
    this.saveKey.on('down', () => this.saveGame());
    this.loadKey.on('down', () => this.loadGame());

    // 尝试自动加载存档
    this.autoLoadGame();
  }

  update(time, delta) {
    // 玩家移动
    const speed = this.playerSpeed * (delta / 1000);
    
    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    // 检测金币碰撞
    this.coins.getChildren().forEach(coin => {
      if (!coin.active) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        coin.x, coin.y
      );

      if (distance < 30) {
        this.collectCoin(coin);
      }
    });

    // 清除状态文本
    if (this.statusTextTimer && time > this.statusTextTimer) {
      this.statusText.setText('');
      this.statusTextTimer = null;
    }
  }

  spawnCoins() {
    // 使用固定种子生成金币位置
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { x: 400, y: 500 },
      { x: 250, y: 250 },
      { x: 550, y: 350 }
    ];

    positions.forEach(pos => {
      const coin = this.add.sprite(pos.x, pos.y, 'coin');
      coin.setData('collected', false);
      this.coins.add(coin);
    });
  }

  collectCoin(coin) {
    if (coin.getData('collected')) return;
    
    coin.setData('collected', true);
    coin.setVisible(false);
    coin.setActive(false);
    
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 如果所有金币都收集完了，重新生成
    const allCollected = this.coins.getChildren().every(c => c.getData('collected'));
    if (allCollected) {
      this.time.delayedCall(1000, () => {
        this.coins.clear(true, true);
        this.spawnCoins();
        this.showStatus('All coins collected! New coins spawned!');
      });
    }
  }

  saveGame() {
    // 收集金币状态
    const coinStates = this.coins.getChildren().map(coin => ({
      x: coin.x,
      y: coin.y,
      collected: coin.getData('collected')
    }));

    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      coins: coinStates,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaser_save_game', JSON.stringify(saveData));
      this.showStatus('Game Saved! Position: (' + 
        Math.round(this.player.x) + ', ' + 
        Math.round(this.player.y) + ') Score: ' + this.score);
      console.log('Game saved:', saveData);
    } catch (e) {
      this.showStatus('Save failed: ' + e.message, '#ff0000');
      console.error('Save error:', e);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      
      if (!savedData) {
        this.showStatus('No save data found!', '#ff9900');
        return;
      }

      const saveData = JSON.parse(savedData);

      // 恢复玩家位置
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;

      // 恢复分数
      this.score = saveData.score;
      this.scoreText.setText('Score: ' + this.score);

      // 恢复金币状态
      if (saveData.coins) {
        this.coins.clear(true, true);
        saveData.coins.forEach(coinData => {
          const coin = this.add.sprite(coinData.x, coinData.y, 'coin');
          coin.setData('collected', coinData.collected);
          coin.setVisible(!coinData.collected);
          coin.setActive(!coinData.collected);
          this.coins.add(coin);
        });
      }

      const savedDate = new Date(saveData.timestamp);
      this.showStatus('Game Loaded! Position: (' + 
        Math.round(saveData.playerX) + ', ' + 
        Math.round(saveData.playerY) + ') Score: ' + saveData.score);
      
      console.log('Game loaded:', saveData);
    } catch (e) {
      this.showStatus('Load failed: ' + e.message, '#ff0000');
      console.error('Load error:', e);
    }
  }

  autoLoadGame() {
    // 启动时自动加载存档（如果存在）
    try {
      const savedData = localStorage.getItem('phaser_save_game');
      if (savedData) {
        this.showStatus('Previous save found. Press L to load.', '#ffff00');
      }
    } catch (e) {
      console.error('Auto-load check error:', e);
    }
  }

  showStatus(message, color = '#00ff00') {
    this.statusText.setText(message);
    this.statusText.setColor(color);
    this.statusTextTimer = this.time.now + 3000; // 3秒后清除
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

new Phaser.Game(config);