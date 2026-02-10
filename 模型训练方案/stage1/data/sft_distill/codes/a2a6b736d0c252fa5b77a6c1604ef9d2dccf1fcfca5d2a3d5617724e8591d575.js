class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.coins = null;
    this.score = 0;
    this.scoreText = null;
    this.messageText = null;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
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
    bg.fillStyle(0x87ceeb, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建金币组
    this.coins = this.physics.add.group();
    this.spawnCoins();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });

    this.messageText = this.add.text(400, 550, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.messageText.setOrigin(0.5);

    // 显示操作提示
    const instructionText = this.add.text(400, 50, 
      'Arrow Keys: Move | SPACE: Save | L: Load', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 设置输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.loadKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.L
    );

    // 监听按键事件
    this.saveKey.on('down', () => {
      this.saveGame();
    });

    this.loadKey.on('down', () => {
      this.loadGame();
    });

    // 尝试自动加载存档
    const savedData = this.getSavedData();
    if (savedData) {
      this.showMessage('Found saved game! Press L to load', 3000);
    }
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  spawnCoins() {
    // 生成固定位置的金币（确定性布局）
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 450 }
    ];

    positions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setData('collected', false);
    });
  }

  collectCoin(player, coin) {
    if (!coin.getData('collected')) {
      coin.setData('collected', true);
      coin.disableBody(true, true);
      this.score += 10;
      this.updateScoreDisplay();
      this.showMessage('+10 points!', 1000);

      // 如果所有金币都收集完了，重新生成
      const activeCoins = this.coins.getChildren().filter(c => c.active);
      if (activeCoins.length === 0) {
        this.showMessage('All coins collected! Spawning new coins...', 2000);
        this.time.delayedCall(1000, () => {
          this.spawnCoins();
        });
      }
    }
  }

  updateScoreDisplay() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  showMessage(text, duration) {
    this.messageText.setText(text);
    this.messageText.setAlpha(1);

    // 清除之前的计时器
    if (this.messageTimer) {
      this.messageTimer.remove();
    }

    // 设置新的淡出计时器
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: this.messageText,
        alpha: 0,
        duration: 500
      });
    });
  }

  saveGame() {
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      coins: this.coins.getChildren().map(coin => ({
        x: coin.x,
        y: coin.y,
        active: coin.active,
        collected: coin.getData('collected')
      })),
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('phaserSaveGame', JSON.stringify(saveData));
      this.showMessage('Game Saved Successfully!', 2000);
      console.log('Game saved:', saveData);
    } catch (error) {
      this.showMessage('Save Failed!', 2000);
      console.error('Save error:', error);
    }
  }

  loadGame() {
    const savedData = this.getSavedData();

    if (!savedData) {
      this.showMessage('No saved game found!', 2000);
      return;
    }

    try {
      // 恢复玩家位置
      this.player.setPosition(savedData.playerX, savedData.playerY);
      this.player.setVelocity(0, 0);

      // 恢复分数
      this.score = savedData.score;
      this.updateScoreDisplay();

      // 恢复金币状态
      this.coins.clear(true, true);
      savedData.coins.forEach(coinData => {
        const coin = this.coins.create(coinData.x, coinData.y, 'coin');
        coin.setData('collected', coinData.collected);
        if (!coinData.active) {
          coin.disableBody(true, true);
        }
      });

      const saveDate = new Date(savedData.timestamp);
      this.showMessage(
        `Game Loaded! (Saved: ${saveDate.toLocaleTimeString()})`,
        3000
      );
      console.log('Game loaded:', savedData);
    } catch (error) {
      this.showMessage('Load Failed!', 2000);
      console.error('Load error:', error);
    }
  }

  getSavedData() {
    try {
      const savedString = localStorage.getItem('phaserSaveGame');
      if (savedString) {
        return JSON.parse(savedString);
      }
    } catch (error) {
      console.error('Error reading save data:', error);
    }
    return null;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);