class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.playerSpeed = 360;
    this.timeLimit = 20; // 20秒限时
    this.totalItems = 8; // 总物品数
    this.collectedItems = 0; // 已收集数量
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillCircle(15, 15, 15);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 在场景中随机分布物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 150, y: 300 },
      { x: 650, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

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
    this.timeText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, '', {
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

    // 创建20秒倒计时
    this.remainingTime = this.timeLimit;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 更新初始UI
    this.updateUI();
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedItems++;
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    this.remainingTime--;
    this.updateUI();

    // 检查时间是否用完
    if (this.remainingTime <= 0) {
      this.loseGame();
    }
  }

  updateUI() {
    this.timeText.setText(`时间: ${this.remainingTime}秒`);
    this.scoreText.setText(`收集: ${this.collectedItems}/${this.totalItems}`);
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.timerEvent.remove();
    this.player.setVelocity(0);

    this.resultText.setText('胜利！\n收集完成！');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    console.log('Game Won! Collected all items in time.');
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.timerEvent.remove();
    this.player.setVelocity(0);

    this.resultText.setText('失败！\n时间用完');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    console.log('Game Over! Time ran out.');
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
  scene: CollectionGame
};

new Phaser.Game(config);