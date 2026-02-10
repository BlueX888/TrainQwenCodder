class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeLimit = 8;
    this.timeRemaining = 8;
    this.gameOver = false;
    this.isWin = false;
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
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining.toFixed(1)}s`, {
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

    // 创建倒计时定时器（每0.1秒更新一次）
    this.timerEvent = this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 创建游戏结束定时器（8秒后）
    this.gameOverTimer = this.time.addEvent({
      delay: this.timeLimit * 1000,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制（速度240）
    const speed = 240;
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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 增加分数
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

    this.timeRemaining = this.timeLimit - (this.gameOverTimer.getElapsed() / 1000);
    
    if (this.timeRemaining < 0) {
      this.timeRemaining = 0;
    }

    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}s`);

    // 时间少于3秒时变红
    if (this.timeRemaining <= 3) {
      this.timerText.setStyle({ fill: '#ff0000' });
    }
  }

  timeUp() {
    if (this.gameOver) {
      return;
    }

    // 如果时间到了但还没收集完所有物品，则失败
    if (this.score < this.totalItems) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.isWin = true;
    
    // 停止定时器
    this.timerEvent.remove();
    this.gameOverTimer.remove();

    // 停止玩家
    this.player.setVelocity(0);

    // 显示胜利信息
    this.resultText.setText('胜利！\n收集完成！');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    console.log('Game Result: WIN', { score: this.score, timeRemaining: this.timeRemaining });
  }

  loseGame() {
    this.gameOver = true;
    this.isWin = false;

    // 停止定时器
    this.timerEvent.remove();

    // 停止玩家
    this.player.setVelocity(0);

    // 显示失败信息
    this.resultText.setText('失败！\n时间到了！');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    console.log('Game Result: LOSE', { score: this.score, totalItems: this.totalItems });
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