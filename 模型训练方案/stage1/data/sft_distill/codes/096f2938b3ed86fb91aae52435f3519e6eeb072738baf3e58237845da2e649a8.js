class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.playerSpeed = 80;
    this.totalItems = 8;
    this.collectedItems = 0;
    this.timeLimit = 12000; // 12秒
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
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理
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
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
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

    // 更新初始显示
    this.updateUI();

    // 创建倒计时器
    this.timeRemaining = this.timeLimit;
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 添加提示文本
    this.add.text(400, 580, '使用方向键移动玩家收集所有黄色物品', {
      fontSize: '18px',
      fill: '#cccccc'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新剩余时间显示
    this.timeRemaining = Math.max(0, this.timeLimit - this.timerEvent.getElapsed());
    this.updateUI();

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedItems++;
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.onGameWin();
    }
  }

  updateUI() {
    const seconds = Math.ceil(this.timeRemaining / 1000);
    this.timeText.setText(`时间: ${seconds} 秒`);
    this.scoreText.setText(`收集: ${this.collectedItems}/${this.totalItems}`);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    
    this.resultText.setText('时间到！游戏失败');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    console.log('Game Over - Time Up');
    console.log(`Collected: ${this.collectedItems}/${this.totalItems}`);
  }

  onGameWin() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.timerEvent.remove();

    const timeUsed = (this.timeLimit - this.timeRemaining) / 1000;
    this.resultText.setText(`成功！用时 ${timeUsed.toFixed(1)} 秒`);
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    console.log('Game Won!');
    console.log(`Time used: ${timeUsed.toFixed(1)} seconds`);
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