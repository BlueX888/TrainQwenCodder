class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 10;
    this.timeLimit = 12;
    this.timeRemaining = 12;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
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
    
    // 随机生成10个物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.collectedText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining}秒`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建倒计时器（每秒触发）
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 创建游戏结束检查器（12秒后）
    this.gameOverTimer = this.time.addEvent({
      delay: this.timeLimit * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 移除物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.collectedText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}秒`);

    // 时间不足3秒时变红
    if (this.timeRemaining <= 3) {
      this.timerText.setColor('#ff0000');
    }
  }

  onTimeUp() {
    if (this.gameOver) return;

    // 检查是否收集完成
    if (this.collectedCount < this.totalItems) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止计时器
    this.timerEvent.remove();
    this.gameOverTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示成功信息
    this.resultText.setText('成功！');
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);

    console.log('Game Won! Collected all items in time.');
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;

    // 停止计时器
    this.timerEvent.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示失败信息
    this.resultText.setText('失败！时间到');
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);

    console.log('Game Over! Time ran out.');
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入，玩家速度360
    const speed = 360;

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
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
  scene: GameScene
};

const game = new Phaser.Game(config);