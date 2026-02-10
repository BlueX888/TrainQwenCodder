class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeRemaining = 8;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
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
  }

  create() {
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
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, '时间: 8.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `收集: 0/${this.totalItems}`, {
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

    // 创建8秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 8000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 创建更新计时器的事件（每100ms更新一次显示）
    this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 移除物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onGameWon();
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    // 计算剩余时间
    this.timeRemaining = Math.max(0, 8 - this.timerEvent.getElapsed() / 1000);
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}s`);
  }

  onTimeUp() {
    if (this.gameOver) return;

    // 检查是否已经收集完所有物品
    if (this.collectedCount < this.totalItems) {
      this.onGameLost();
    }
  }

  onGameWon() {
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 显示胜利信息
    this.resultText.setText('成功！\n收集完成！');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    console.log('Game Won! Collected all items in time.');
  }

  onGameLost() {
    this.gameOver = true;
    this.gameWon = false;

    // 显示失败信息
    this.resultText.setText('失败！\n时间到！');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    console.log('Game Lost! Time ran out.');
  }

  update() {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0, 0);

    // 键盘控制（速度160）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(160);
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

new Phaser.Game(config);