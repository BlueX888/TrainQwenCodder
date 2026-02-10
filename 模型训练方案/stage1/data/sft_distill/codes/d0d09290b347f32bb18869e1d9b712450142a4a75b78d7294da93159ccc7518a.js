class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.coins = null;
    this.cursors = null;
    this.spaceKey = null;
    this.lKey = null;
    this.saveKey = 'phaser_game_save';
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
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
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(1);

    // 创建金币组
    this.coins = this.add.group();
    this.spawnCoins();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建状态文本
    this.statusText = this.add.text(16, 50, 'Press SPACE to Save | Press L to Load', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    });

    // 创建存档提示文本
    this.saveInfoText = this.add.text(400, 550, '', {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建控制说明
    this.add.text(16, 80, 'Arrow Keys: Move | Collect yellow coins', {
      fontSize: '14px',
      fill: '#888888',
      fontFamily: 'Arial'
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听保存键
    this.spaceKey.on('down', () => {
      this.saveGame();
    });

    // 监听读取键
    this.lKey.on('down', () => {
      this.loadGame();
    });

    // 尝试自动加载存档
    this.checkSaveExists();
  }

  update() {
    // 玩家移动
    const speed = 200;
    const delta = this.game.loop.delta / 1000;

    if (this.cursors.left.isDown) {
      this.player.x -= speed * delta;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed * delta;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed * delta;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed * delta;
    }

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, 784);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, 584);

    // 检测金币碰撞
    this.coins.getChildren().forEach(coin => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        coin.x, coin.y
      );
      
      if (distance < 30) {
        this.collectCoin(coin);
      }
    });

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);
  }

  spawnCoins() {
    // 使用固定种子生成金币位置
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const coin = this.add.sprite(pos.x, pos.y, 'coin');
      coin.setData('collected', false);
      this.coins.add(coin);
    });
  }

  collectCoin(coin) {
    if (!coin.getData('collected')) {
      coin.setData('collected', true);
      coin.setVisible(false);
      this.score += 10;
      
      // 显示收集提示
      this.showMessage('+10', coin.x, coin.y);
    }
  }

  showMessage(text, x, y) {
    const msg = this.add.text(x, y, text, {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        msg.destroy();
      }
    });
  }

  saveGame() {
    // 收集金币状态
    const coinsData = [];
    this.coins.getChildren().forEach((coin, index) => {
      coinsData.push({
        index: index,
        collected: coin.getData('collected'),
        visible: coin.visible
      });
    });

    // 创建存档数据
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      coins: coinsData,
      timestamp: Date.now()
    };

    // 保存到 localStorage
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      this.showSaveInfo('Game Saved Successfully!', 0x00ff00);
      console.log('Game saved:', saveData);
    } catch (e) {
      this.showSaveInfo('Save Failed!', 0xff0000);
      console.error('Save error:', e);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      
      if (!savedData) {
        this.showSaveInfo('No Save Data Found!', 0xff9900);
        return;
      }

      const saveData = JSON.parse(savedData);

      // 恢复玩家位置
      this.player.x = saveData.playerX;
      this.player.y = saveData.playerY;

      // 恢复分数
      this.score = saveData.score;

      // 恢复金币状态
      const coins = this.coins.getChildren();
      saveData.coins.forEach(coinData => {
        if (coins[coinData.index]) {
          coins[coinData.index].setData('collected', coinData.collected);
          coins[coinData.index].setVisible(coinData.visible);
        }
      });

      this.showSaveInfo('Game Loaded Successfully!', 0x00ffff);
      console.log('Game loaded:', saveData);
    } catch (e) {
      this.showSaveInfo('Load Failed!', 0xff0000);
      console.error('Load error:', e);
    }
  }

  checkSaveExists() {
    const savedData = localStorage.getItem(this.saveKey);
    if (savedData) {
      const saveData = JSON.parse(savedData);
      const date = new Date(saveData.timestamp);
      this.statusText.setText(
        `Press SPACE to Save | Press L to Load\nLast save: ${date.toLocaleString()}`
      );
    }
  }

  showSaveInfo(message, color) {
    this.saveInfoText.setText(message);
    this.saveInfoText.setColor('#' + color.toString(16).padStart(6, '0'));
    this.saveInfoText.setAlpha(1);

    // 淡出动画
    this.tweens.add({
      targets: this.saveInfoText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);