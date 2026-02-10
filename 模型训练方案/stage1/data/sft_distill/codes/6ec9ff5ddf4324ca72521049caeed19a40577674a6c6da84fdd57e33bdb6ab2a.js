// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  gameState: 'playing', // playing, win, lose
  itemsCollected: 0,
  totalItems: 0,
  timeRemaining: 15,
  playerSpeed: 80,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timerEvent = null;
    this.timerText = null;
    this.scoreText = null;
    this.resultText = null;
    this.totalItems = 8; // 总共8个物品
    this.collectedItems = 0;
    this.timeLimit = 15; // 15秒限时
    this.gameOver = false;
  }

  preload() {
    // 使用Graphics生成纹理，不依赖外部资源
  }

  create() {
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
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置碰撞体为圆形
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `物品: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeLimit}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建倒计时定时器
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 每秒触发
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 初始化全局信号
    window.__signals__.totalItems = this.totalItems;
    window.__signals__.itemsCollected = 0;
    window.__signals__.timeRemaining = this.timeLimit;
    window.__signals__.playerSpeed = 80;
    window.__signals__.gameState = 'playing';
    window.__signals__.events.push({
      type: 'game_start',
      timestamp: Date.now(),
      data: { totalItems: this.totalItems, timeLimit: this.timeLimit }
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit
    }));
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制，速度为80
    const speed = 80;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    this.collectedItems++;

    // 更新UI
    this.scoreText.setText(`物品: ${this.collectedItems}/${this.totalItems}`);

    // 更新全局信号
    window.__signals__.itemsCollected = this.collectedItems;
    window.__signals__.events.push({
      type: 'item_collected',
      timestamp: Date.now(),
      data: { 
        collected: this.collectedItems, 
        remaining: this.totalItems - this.collectedItems 
      }
    });

    console.log(JSON.stringify({
      event: 'item_collected',
      collected: this.collectedItems,
      remaining: this.totalItems - this.collectedItems
    }));

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeLimit--;
    this.timerText.setText(`时间: ${this.timeLimit}s`);

    // 更新全局信号
    window.__signals__.timeRemaining = this.timeLimit;

    // 检查是否超时
    if (this.timeLimit <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.timerEvent.remove();
    this.player.setVelocity(0);

    this.resultText.setText('胜利！\n收集完成！');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    // 更新全局信号
    window.__signals__.gameState = 'win';
    window.__signals__.events.push({
      type: 'game_win',
      timestamp: Date.now(),
      data: { 
        itemsCollected: this.collectedItems, 
        timeRemaining: this.timeLimit 
      }
    });

    console.log(JSON.stringify({
      event: 'game_win',
      itemsCollected: this.collectedItems,
      timeRemaining: this.timeLimit
    }));
  }

  loseGame() {
    this.gameOver = true;
    this.timerEvent.remove();
    this.player.setVelocity(0);

    this.resultText.setText('失败！\n时间到！');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    // 更新全局信号
    window.__signals__.gameState = 'lose';
    window.__signals__.events.push({
      type: 'game_lose',
      timestamp: Date.now(),
      data: { 
        itemsCollected: this.collectedItems, 
        itemsMissed: this.totalItems - this.collectedItems 
      }
    });

    console.log(JSON.stringify({
      event: 'game_lose',
      itemsCollected: this.collectedItems,
      itemsMissed: this.totalItems - this.collectedItems
    }));
  }
}

// Phaser游戏配置
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
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);