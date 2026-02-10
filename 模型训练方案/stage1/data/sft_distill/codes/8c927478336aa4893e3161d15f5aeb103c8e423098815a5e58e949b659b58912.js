// 全局信号对象
window.__signals__ = {
  gameState: 'playing', // playing, win, lose
  itemsCollected: 0,
  totalItems: 0,
  timeRemaining: 3,
  playerSpeed: 200
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timer = null;
    this.timerText = null;
    this.resultText = null;
    this.itemsCollected = 0;
    this.totalItems = 5;
    this.timeLimit = 3000; // 3秒
    this.gameOver = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 初始化信号
    window.__signals__.totalItems = this.totalItems;
    window.__signals__.itemsCollected = 0;
    window.__signals__.gameState = 'playing';
    window.__signals__.timeRemaining = 3;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品位置
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 }
    ];

    for (let i = 0; i < this.totalItems; i++) {
      const item = this.items.create(positions[i].x, positions[i].y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建倒计时显示
    this.timerText = this.add.text(400, 30, 'Time: 3.0s', {
      fontSize: '32px',
      fill: '#ffffff'
    });
    this.timerText.setOrigin(0.5);

    // 创建收集计数显示
    this.scoreText = this.add.text(400, 70, `Items: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.scoreText.setOrigin(0.5);

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建3秒倒计时
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit / 1000
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新倒计时显示
    const remaining = this.timer.getRemaining();
    const seconds = (remaining / 1000).toFixed(1);
    this.timerText.setText(`Time: ${seconds}s`);
    window.__signals__.timeRemaining = parseFloat(seconds);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.itemsCollected++;
    window.__signals__.itemsCollected = this.itemsCollected;

    // 更新显示
    this.scoreText.setText(`Items: ${this.itemsCollected}/${this.totalItems}`);

    console.log(JSON.stringify({
      event: 'item_collected',
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems
    }));

    // 检查胜利条件
    if (this.itemsCollected >= this.totalItems) {
      this.winGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.timer.remove();
    window.__signals__.gameState = 'win';

    this.resultText.setText('SUCCESS!');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    this.player.setVelocity(0);

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'win',
      itemsCollected: this.itemsCollected,
      timeRemaining: (this.timer.getRemaining() / 1000).toFixed(1)
    }));
  }

  timeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    window.__signals__.gameState = 'lose';
    window.__signals__.timeRemaining = 0;

    this.resultText.setText('TIME UP - FAILED!');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    this.player.setVelocity(0);

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'lose',
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      reason: 'timeout'
    }));
  }
}

// Phaser 游戏配置
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

// 启动游戏
new Phaser.Game(config);