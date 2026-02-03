class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 10;
    this.gameOver = false;
    this.gameWon = false;
    this.timeRemaining = 15;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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
      item.setCircle(12);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining}秒`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建15秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 15秒后游戏结束
    this.gameTimer = this.time.addEvent({
      delay: 15000,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });
  }

  update() {
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
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}秒`);

    if (this.timeRemaining <= 0) {
      this.timerText.setText(`时间: 0秒`);
    }
  }

  timeUp() {
    if (this.gameWon) {
      return;
    }

    this.gameOver = true;
    this.player.setVelocity(0);
    
    this.resultText.setText('时间到！游戏失败！');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    // 停止倒计时
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    console.log('Game Over - Time Up');
    console.log(`Final Score: ${this.score}/${this.totalItems}`);
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);

    this.resultText.setText('恭喜！收集完成！');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    // 停止所有计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    if (this.gameTimer) {
      this.gameTimer.remove();
    }

    console.log('Game Won!');
    console.log(`Time Remaining: ${this.timeRemaining} seconds`);
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