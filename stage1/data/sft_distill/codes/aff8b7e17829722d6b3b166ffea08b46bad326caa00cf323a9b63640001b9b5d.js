class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeRemaining = 15;
    this.gameOver = false;
    this.gameResult = null; // 'win' or 'lose'
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      collectedCount: 0,
      totalItems: this.totalItems,
      timeRemaining: 15,
      gameOver: false,
      gameResult: null
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
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
    
    // 在场景中随机放置物品
    const positions = [
      { x: 100, y: 100 }, { x: 700, y: 100 },
      { x: 100, y: 500 }, { x: 700, y: 500 },
      { x: 400, y: 100 }, { x: 400, y: 500 },
      { x: 200, y: 300 }, { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 15s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建15秒倒计时
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(400, 580, 'Use Arrow Keys to Move - Collect all items in 15 seconds!', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: 15,
      playerSpeed: 80
    }));
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 更新信号
    window.__signals__.collectedCount = this.collectedCount;

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedCount: this.collectedCount,
      remaining: this.totalItems - this.collectedCount
    }));

    // 检查胜利条件
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timeRemaining--;
    this.timerText.setText(`Time: ${this.timeRemaining}s`);

    // 更新信号
    window.__signals__.timeRemaining = this.timeRemaining;

    // 时间警告（最后5秒变红）
    if (this.timeRemaining <= 5) {
      this.timerText.setStyle({ fill: '#ff0000' });
    }

    // 检查失败条件
    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameResult = 'win';
    
    this.timer.remove();
    this.player.setVelocity(0, 0);

    this.resultText.setText('SUCCESS!');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    // 更新信号
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'win';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'win',
      collectedCount: this.collectedCount,
      timeRemaining: this.timeRemaining
    }));
  }

  loseGame() {
    this.gameOver = true;
    this.gameResult = 'lose';
    
    this.timer.remove();
    this.player.setVelocity(0, 0);

    this.resultText.setText('TIME UP - FAILED!');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    // 更新信号
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'lose';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'lose',
      collectedCount: this.collectedCount,
      totalItems: this.totalItems
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制（速度80）
    const speed = 80;

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