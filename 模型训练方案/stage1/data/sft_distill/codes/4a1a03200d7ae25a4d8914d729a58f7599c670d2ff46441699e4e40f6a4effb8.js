class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timerEvent = null;
    this.timeText = null;
    this.scoreText = null;
    this.resultText = null;
    this.totalItems = 5;
    this.collectedItems = 0;
    this.timeLimit = 10; // 10秒
    this.gameOver = false;
    
    // 可验证的状态信号
    window.__signals__ = {
      score: 0,
      timeRemaining: 10,
      totalItems: 5,
      collectedItems: 0,
      gameStatus: 'playing', // playing, success, failed
      playerSpeed: 360
    };
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 10s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, 'Collected: 0/5', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建10秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 每秒触发
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
      repeat: this.timeLimit - 1
    });

    // 输出初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit,
      playerSpeed: 360
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制，速度360
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-360);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(360);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(360);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedItems++;
    
    // 更新UI
    this.scoreText.setText(`Collected: ${this.collectedItems}/${this.totalItems}`);
    
    // 更新signals
    window.__signals__.collectedItems = this.collectedItems;
    window.__signals__.score = this.collectedItems * 100;

    // 输出收集日志
    console.log(JSON.stringify({
      event: 'item_collected',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems,
      timeRemaining: window.__signals__.timeRemaining
    }));

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.gameWin();
    }
  }

  updateTimer() {
    const elapsed = this.timerEvent.getElapsed() / 1000;
    const remaining = Math.max(0, this.timeLimit - Math.floor(elapsed));
    
    this.timeText.setText(`Time: ${remaining}s`);
    window.__signals__.timeRemaining = remaining;

    // 时间到，游戏失败
    if (remaining <= 0 && !this.gameOver) {
      this.gameFail();
    }
  }

  gameWin() {
    this.gameOver = true;
    this.timerEvent.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);
    
    window.__signals__.gameStatus = 'success';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'success',
      collectedItems: this.collectedItems,
      timeRemaining: window.__signals__.timeRemaining,
      finalScore: window.__signals__.score
    }));
  }

  gameFail() {
    this.gameOver = true;
    this.timerEvent.remove();
    
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);
    
    window.__signals__.gameStatus = 'failed';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'failed',
      collectedItems: this.collectedItems,
      timeRemaining: 0,
      finalScore: window.__signals__.score
    }));
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
  scene: GameScene
};

new Phaser.Game(config);