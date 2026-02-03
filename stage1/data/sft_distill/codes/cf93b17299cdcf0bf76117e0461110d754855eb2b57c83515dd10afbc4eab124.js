class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.feedbackText = null;
    this.cursors = null;
    this.saveKey = null;
    this.SAVE_KEY = 'phaser_game_save';
  }

  preload() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建收集物纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(8, 8, 8);
    coinGraphics.generateTexture('coin', 16, 16);
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

    // 初始化分数
    this.score = 0;

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setDepth(100);

    // 创建反馈文本
    this.feedbackText = this.add.text(400, 50, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.feedbackText.setOrigin(0.5, 0.5);
    this.feedbackText.setDepth(100);

    // 创建说明文本
    const instructionText = this.add.text(400, 550, 
      'WASD: Move | Right Click: Save | S Key: Load', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    instructionText.setOrigin(0.5, 0.5);
    instructionText.setDepth(100);

    // 创建收集物
    this.coins = [];
    this.createCoins();

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 设置保存/加载键
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    
    // 监听鼠标右键保存
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.saveGame();
      }
    });

    // 监听S键加载（需要配合Ctrl键以避免与移动冲突）
    this.input.keyboard.on('keydown-L', () => {
      this.loadGame();
    });

    // 添加L键说明
    const loadKeyText = this.add.text(400, 520, 
      'L Key: Load Save', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    loadKeyText.setOrigin(0.5, 0.5);
    loadKeyText.setDepth(100);

    // 尝试自动加载存档
    this.showFeedback('Game Started! Move with WASD', 2000);
  }

  createCoins() {
    // 创建随机分布的收集物
    const seed = 12345;
    const random = new Phaser.Math.RandomDataGenerator([seed]);
    
    for (let i = 0; i < 10; i++) {
      const x = random.between(50, 750);
      const y = random.between(100, 500);
      const coin = this.add.sprite(x, y, 'coin');
      coin.setData('value', 10);
      this.coins.push(coin);
    }
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200 * (delta / 1000);
    let moved = false;

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

    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    // 移动增加少量分数
    if (moved) {
      this.addScore(0.1);
    }

    // 检测收集物碰撞
    this.checkCoinCollision();
  }

  checkCoinCollision() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (!coin.active) continue;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        coin.x, coin.y
      );

      if (distance < 24) {
        // 收集金币
        const value = coin.getData('value');
        this.addScore(value);
        coin.destroy();
        this.coins.splice(i, 1);
        this.showFeedback(`+${value} points!`, 1000);
      }
    }
  }

  addScore(value) {
    this.score += value;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
  }

  saveGame() {
    // 收集当前游戏状态
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now(),
      coinsCollected: 10 - this.coins.length,
      remainingCoins: this.coins.map(coin => ({
        x: coin.x,
        y: coin.y,
        value: coin.getData('value')
      }))
    };

    // 保存到localStorage
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      this.showFeedback('Game Saved!', 2000);
      console.log('Game saved:', saveData);
    } catch (e) {
      this.showFeedback('Save Failed!', 2000);
      console.error('Save error:', e);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      
      if (!savedData) {
        this.showFeedback('No Save Found!', 2000);
        return;
      }

      const saveData = JSON.parse(savedData);

      // 恢复玩家位置
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;

      // 恢复分数
      this.score = saveData.score;
      this.scoreText.setText(`Score: ${Math.floor(this.score)}`);

      // 清除当前金币
      this.coins.forEach(coin => coin.destroy());
      this.coins = [];

      // 恢复金币状态
      if (saveData.remainingCoins) {
        saveData.remainingCoins.forEach(coinData => {
          const coin = this.add.sprite(coinData.x, coinData.y, 'coin');
          coin.setData('value', coinData.value);
          this.coins.push(coin);
        });
      }

      const savedDate = new Date(saveData.timestamp);
      this.showFeedback(`Save Loaded! (${savedDate.toLocaleTimeString()})`, 2000);
      console.log('Game loaded:', saveData);

    } catch (e) {
      this.showFeedback('Load Failed!', 2000);
      console.error('Load error:', e);
    }
  }

  showFeedback(message, duration) {
    this.feedbackText.setText(message);
    this.feedbackText.setAlpha(1);

    // 清除之前的定时器
    if (this.feedbackTimer) {
      this.feedbackTimer.remove();
    }

    // 设置淡出效果
    this.feedbackTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: this.feedbackText,
        alpha: 0,
        duration: 500,
        ease: 'Power2'
      });
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);