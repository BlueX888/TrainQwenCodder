class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedItems = 0;
    this.totalItems = 8;
    this.gameOver = false;
    this.gameWon = false;
    this.timeRemaining = 5;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillRect(0, 0, 20, 20);
    itemGraphics.generateTexture('item', 20, 20);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 随机生成收集物品
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

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player, 
      this.items, 
      this.collectItem, 
      null, 
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedItems}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining.toFixed(1)}秒`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建5秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 5000,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });

    // 创建用于更新倒计时显示的事件
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

    // 玩家移动控制，速度为120
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-120);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(120);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-120);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(120);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(120);
    }
  }

  collectItem(player, item) {
    if (this.gameOver) {
      return;
    }

    // 销毁收集到的物品
    item.destroy();
    
    // 更新收集数量
    this.collectedItems++;
    this.scoreText.setText(`收集: ${this.collectedItems}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    // 更新剩余时间显示
    this.timeRemaining = Math.max(0, 5 - this.timerEvent.getElapsed() / 1000);
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}秒`);
  }

  timeUp() {
    if (this.gameOver) {
      return;
    }

    // 如果还没收集完所有物品，游戏失败
    if (this.collectedItems < this.totalItems) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.statusText.setText('成功！\n收集完成！');
    this.statusText.setStyle({ fill: '#00ff00' });
    
    console.log('Game Won! Collected:', this.collectedItems, '/', this.totalItems);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    
    this.statusText.setText('失败！\n时间到了！');
    this.statusText.setStyle({ fill: '#ff0000' });
    
    console.log('Game Over! Only collected:', this.collectedItems, '/', this.totalItems);
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