class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeRemaining = 12;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成8个物品
    const positions = [
      { x: 100, y: 100 }, { x: 700, y: 100 },
      { x: 100, y: 500 }, { x: 700, y: 500 },
      { x: 400, y: 100 }, { x: 400, y: 500 },
      { x: 200, y: 300 }, { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建倒计时器（每秒触发一次）
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 移除物品
    item.destroy();
    
    // 增加计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}s`);

    // 时间用完
    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.timerEvent.remove();
    this.player.setVelocity(0, 0);
    
    this.resultText.setText('成功！\n收集完成！');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    console.log('Game Won! Collected all items in time.');
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.timerEvent.remove();
    this.player.setVelocity(0, 0);
    
    this.resultText.setText('失败！\n时间用完！');
    this.resultText.setStyle({ fill: '#ff0000' });
    
    console.log('Game Over! Time ran out.');
  }

  update() {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制，速度为80
    const speed = 80;
    
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

new Phaser.Game(config);