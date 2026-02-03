class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 5;
    this.timeLimit = 3000; // 3秒
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
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
      { x: 400, y: 150 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, '剩余时间: 3.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);

    // 创建倒计时器
    this.timeRemaining = this.timeLimit;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 用于显示剩余时间的更新器
    this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制，速度为300
    const speed = 300;
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
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.onGameWon();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining = Math.max(0, this.timeLimit - this.timer.getElapsed());
    const seconds = (this.timeRemaining / 1000).toFixed(1);
    this.timerText.setText(`剩余时间: ${seconds}s`);
  }

  onTimeUp() {
    if (!this.gameWon) {
      this.onGameLost();
    }
  }

  onGameWon() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.resultText.setText('成功！收集完成！');
    this.resultText.setFill('#00ff00');
    
    console.log('Game Won! Score:', this.score);
  }

  onGameLost() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.resultText.setText('失败！超时了！');
    this.resultText.setFill('#ff0000');
    
    console.log('Game Lost! Score:', this.score, '/', this.totalItems);
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