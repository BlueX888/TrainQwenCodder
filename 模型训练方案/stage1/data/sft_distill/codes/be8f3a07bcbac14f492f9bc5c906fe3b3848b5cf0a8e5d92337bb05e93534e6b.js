class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.timeLimit = 8000; // 8 秒
    this.playerSpeed = 200;
    this.gameOver = false;
    this.gameResult = null; // 'win' or 'lose'
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      collectedCount: 0,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit / 1000,
      gameOver: false,
      gameResult: null,
      playerSpeed: this.playerSpeed
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

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建倒计时文本
    this.timerText = this.add.text(16, 16, 'Time: 8.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建收集进度文本
    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建 8 秒倒计时器
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 记录开始时间
    this.startTime = this.time.now;

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit / 1000,
      playerSpeed: this.playerSpeed
    }));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新剩余时间显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
    this.timerText.setText(`Time: ${remaining.toFixed(1)}s`);
    
    window.__signals__.timeRemaining = parseFloat(remaining.toFixed(1));

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
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);
    
    // 更新 signals
    window.__signals__.collectedCount = this.collectedCount;

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedCount: this.collectedCount,
      totalItems: this.totalItems
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onWin();
    }
  }

  onWin() {
    this.gameOver = true;
    this.gameResult = 'win';
    
    // 停止计时器
    this.timer.remove();
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 显示胜利信息
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    // 更新 signals
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'win';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'win',
      collectedCount: this.collectedCount,
      timeRemaining: window.__signals__.timeRemaining
    }));
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameResult = 'lose';
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 显示失败信息
    this.resultText.setText('TIME UP!\nYou Failed!');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    // 更新 signals
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'lose';
    window.__signals__.timeRemaining = 0;

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'lose',
      collectedCount: this.collectedCount,
      totalItems: this.totalItems,
      reason: 'timeout'
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
  scene: CollectionGame
};

new Phaser.Game(config);