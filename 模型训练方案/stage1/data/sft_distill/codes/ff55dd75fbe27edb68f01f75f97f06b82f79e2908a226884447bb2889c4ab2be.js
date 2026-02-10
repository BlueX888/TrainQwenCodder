class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.gameWon = false;
    this.totalItems = 5;
    this.collectedItems = 0;
    this.timeLimit = 3000; // 3秒
    this.remainingTime = 3000;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成5个物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 3.00s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, 'Items: 0/5', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建3秒倒计时
    this.gameTimer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 用于更新倒计时显示
    this.timeUpdateEvent = this.time.addEvent({
      delay: 10,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制，速度300
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(300);
    }
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedItems++;
    this.scoreText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.remainingTime = this.timeLimit - this.gameTimer.getElapsed();
    
    if (this.remainingTime < 0) {
      this.remainingTime = 0;
    }

    const seconds = (this.remainingTime / 1000).toFixed(2);
    this.timerText.setText(`Time: ${seconds}s`);
  }

  onTimeUp() {
    // 时间到，检查是否已经胜利
    if (!this.gameWon && !this.gameOver) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    // 停止计时器
    if (this.gameTimer) {
      this.gameTimer.remove();
    }
    if (this.timeUpdateEvent) {
      this.timeUpdateEvent.remove();
    }

    console.log('Game Won! Items collected:', this.collectedItems);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setStyle({ fill: '#ff0000' });

    // 停止计时器
    if (this.timeUpdateEvent) {
      this.timeUpdateEvent.remove();
    }

    console.log('Game Lost! Items collected:', this.collectedItems, '/', this.totalItems);
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