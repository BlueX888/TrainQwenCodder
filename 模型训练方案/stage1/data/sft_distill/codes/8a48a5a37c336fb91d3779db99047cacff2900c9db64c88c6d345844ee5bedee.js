class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 8;
    this.timeRemaining = 8;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillRect(0, 0, 20, 20);
    itemGraphics.generateTexture('item', 20, 20);
    itemGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

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
      item.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining.toFixed(1)}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建倒计时器（每0.1秒更新一次显示）
    this.timerEvent = this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 创建游戏结束检查定时器
    this.checkTimer = this.time.addEvent({
      delay: this.timeLimit * 1000,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-240);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(240);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(240);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    // 计算剩余时间
    this.timeRemaining = this.timeLimit - (this.checkTimer.getElapsed() / 1000);
    
    if (this.timeRemaining < 0) {
      this.timeRemaining = 0;
    }

    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}s`);

    // 时间不足3秒时变红
    if (this.timeRemaining < 3) {
      this.timerText.setColor('#ff0000');
    }
  }

  timeUp() {
    if (!this.gameOver && !this.gameWon) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止定时器
    this.timerEvent.remove();
    this.checkTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示成功信息
    this.resultText.setText('成功！\n收集完成！');
    this.resultText.setColor('#00ff00');

    console.log('Game Won! Collected:', this.collectedCount, 'Time remaining:', this.timeRemaining.toFixed(1));
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;

    // 停止定时器
    this.timerEvent.remove();
    this.checkTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示失败信息
    this.resultText.setText('失败！\n时间到了！');
    this.resultText.setColor('#ff0000');

    console.log('Game Over! Collected:', this.collectedCount, '/', this.totalItems);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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