class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 5;
    this.gameOver = false;
    this.success = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（黄色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 随机生成收集物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.timerText = this.add.text(16, 16, `时间: ${this.timeLimit}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 设置5秒倒计时
    this.timeRemaining = this.timeLimit;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
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
    this.timerText.setText(`时间: ${this.timeRemaining}`);

    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.success = true;
    this.player.setVelocity(0, 0);
    this.statusText.setText('成功！').setColor('#00ff00');
    this.timerEvent.remove();
    console.log('Game Status: SUCCESS');
  }

  loseGame() {
    this.gameOver = true;
    this.success = false;
    this.player.setVelocity(0, 0);
    this.statusText.setText('失败！超时').setColor('#ff0000');
    this.timerEvent.remove();
    console.log('Game Status: FAILED - Timeout');
  }

  update() {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制，速度360
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

new Phaser.Game(config);