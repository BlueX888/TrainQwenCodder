class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.timeLimit = 8000; // 8秒
    this.gameOver = false;
    this.isSuccess = false;
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
      { x: 400, y: 100 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 添加碰撞检测
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
    this.timeText = this.add.text(16, 16, 'Time: 8.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `Items: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建倒计时器
    this.startTime = this.time.now;
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新倒计时显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
    this.timeText.setText(`Time: ${remaining.toFixed(1)}s`);

    // 玩家移动控制
    this.player.setVelocity(0);

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

    // 标准化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(160);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    this.scoreText.setText(`Items: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.gameWin();
    }
  }

  timeUp() {
    if (!this.gameOver && this.collectedCount < this.totalItems) {
      this.gameFail();
    }
  }

  gameWin() {
    this.gameOver = true;
    this.isSuccess = true;
    this.player.setVelocity(0);
    this.resultText.setText('SUCCESS!\nAll Items Collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
  }

  gameFail() {
    this.gameOver = true;
    this.isSuccess = false;
    this.player.setVelocity(0);
    this.resultText.setText('FAILED!\nTime Up!');
    this.resultText.setStyle({ fill: '#ff0000' });
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