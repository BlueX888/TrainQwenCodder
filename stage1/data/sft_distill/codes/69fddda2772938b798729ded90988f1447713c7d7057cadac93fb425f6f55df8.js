class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeRemaining = 5;
    this.gameOver = false;
    this.gameWon = false;
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
    
    // 随机生成物品位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 200, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.scoreText = this.add.text(16, 16, `已收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `剩余时间: ${this.timeRemaining.toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.statusText.setOrigin(0.5);

    // 创建5秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 5000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 用于更新倒计时显示
    this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制，速度200
    const speed = 200;
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
    item.destroy();
    this.score++;
    this.scoreText.setText(`已收集: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining = Math.max(0, 5 - this.timerEvent.getElapsed() / 1000);
    this.timerText.setText(`剩余时间: ${this.timeRemaining.toFixed(1)}秒`);
  }

  onTimeUp() {
    if (!this.gameOver && this.score < this.totalItems) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.statusText.setText('成功！收集完成！');
    this.statusText.setFill('#00ff00');
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    console.log('Game Won! Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    this.statusText.setText('失败！时间到！');
    this.statusText.setFill('#ff0000');
    
    console.log('Game Over! Score:', this.score, '/', this.totalItems);
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
  scene: CollectGameScene
};

new Phaser.Game(config);