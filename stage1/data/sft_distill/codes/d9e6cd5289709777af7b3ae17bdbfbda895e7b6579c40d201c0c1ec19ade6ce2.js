class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.playerSpeed = 360;
    this.timeLimit = 10; // 10秒
    this.totalItems = 5;
    this.collectedItems = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      gameState: 'playing',
      collectedItems: 0,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit,
      playerSpeed: this.playerSpeed,
      result: null
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.itemText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建10秒倒计时
    this.remainingTime = this.timeLimit;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    this.updateUI();
    this.logState('Game started');
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedItems++;
    
    this.updateUI();
    this.logState(`Item collected (${this.collectedItems}/${this.totalItems})`);

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    this.remainingTime--;
    
    window.__signals__.timeRemaining = this.remainingTime;
    
    this.updateUI();

    if (this.remainingTime <= 0) {
      this.timerEvent.remove();
      if (!this.gameWon) {
        this.loseGame();
      }
    }
  }

  updateUI() {
    this.timerText.setText(`Time: ${this.remainingTime}s`);
    this.itemText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);
    
    window.__signals__.collectedItems = this.collectedItems;
    window.__signals__.timeRemaining = this.remainingTime;
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.timerEvent.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    window.__signals__.gameState = 'won';
    window.__signals__.result = 'success';
    
    this.logState('Game won');
    
    // 停止玩家移动
    this.player.setVelocity(0);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    
    this.resultText.setText('FAILED!\nTime\'s up!');
    this.resultText.setStyle({ fill: '#ff0000' });
    
    window.__signals__.gameState = 'lost';
    window.__signals__.result = 'failed';
    
    this.logState('Game lost - timeout');
    
    // 停止玩家移动
    this.player.setVelocity(0);
  }

  logState(message) {
    const logEntry = {
      timestamp: Date.now(),
      message: message,
      state: {
        collectedItems: this.collectedItems,
        totalItems: this.totalItems,
        timeRemaining: this.remainingTime,
        gameState: window.__signals__.gameState
      }
    };
    console.log(JSON.stringify(logEntry));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectionGame
};

new Phaser.Game(config);