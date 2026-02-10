class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.gameOver = false;
    this.timeLimit = 5000; // 5秒
    this.timeRemaining = 5000;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（黄色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 在场景中随机放置物品
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
      item.setCircle(12); // 设置圆形碰撞体
    });

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

    // 创建 UI 文本
    this.timerText = this.add.text(16, 16, 'Time: 5.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
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

    // 创建倒计时器
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新剩余时间显示
    this.timeRemaining = Math.max(0, this.timeLimit - this.timer.getElapsed());
    this.timerText.setText(`Time: ${(this.timeRemaining / 1000).toFixed(1)}s`);

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-360);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(360);
    }

    // 对角线移动时保持速度恒定
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(360);
    }
  }

  collectItem(player, item) {
    // 移除收集到的物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onSuccess();
    }
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    // 时间到，检查是否收集完所有物品
    if (this.collectedCount < this.totalItems) {
      this.onFailure();
    }
  }

  onSuccess() {
    this.gameOver = true;
    this.player.setVelocity(0);
    
    // 停止计时器
    if (this.timer) {
      this.timer.remove();
    }

    // 显示成功信息
    this.resultText.setText('SUCCESS!\nAll Items Collected!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    console.log('Game Status: SUCCESS - All items collected in time');
  }

  onFailure() {
    this.gameOver = true;
    this.player.setVelocity(0);

    // 显示失败信息
    this.resultText.setText('TIME UP!\nFailed to Collect All Items');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    console.log(`Game Status: FAILURE - Only collected ${this.collectedCount}/${this.totalItems} items`);
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

const game = new Phaser.Game(config);