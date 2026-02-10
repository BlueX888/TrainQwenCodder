class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.itemsCollected = 0;
    this.totalItems = 5;
    this.timeRemaining = 5;
    this.gameOver = false;
    this.gameResult = null; // 'success' or 'failed'
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
    
    // 随机生成5个物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

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
    this.timerText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建5秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 更新UI
    this.updateUI();
  }

  update(time, delta) {
    if (this.gameOver) {
      this.player.setVelocity(0, 0);
      return;
    }

    // 玩家移动控制，速度300
    const speed = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 增加收集计数
    this.itemsCollected++;
    
    // 更新UI
    this.updateUI();
    
    // 检查是否收集完所有物品
    if (this.itemsCollected >= this.totalItems) {
      this.endGame('success');
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining--;
    this.updateUI();

    // 检查是否超时
    if (this.timeRemaining <= 0) {
      this.endGame('failed');
    }
  }

  updateUI() {
    this.timerText.setText(`Time: ${this.timeRemaining}s`);
    this.scoreText.setText(`Items: ${this.itemsCollected}/${this.totalItems}`);
  }

  endGame(result) {
    this.gameOver = true;
    this.gameResult = result;
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 显示结果
    if (result === 'success') {
      this.resultText.setText('SUCCESS!\nAll items collected!');
      this.resultText.setFill('#00ff00');
    } else {
      this.resultText.setText('FAILED!\nTime is up!');
      this.resultText.setFill('#ff0000');
    }

    // 输出状态信号到控制台
    console.log('Game Over:', {
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      timeRemaining: this.timeRemaining,
      gameOver: this.gameOver,
      gameResult: this.gameResult
    });
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