class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.gameOver = false;
    this.won = false;
    this.timeRemaining = 3;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆圈）
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

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.timerText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建3秒倒计时
    this.timer = this.time.addEvent({
      delay: 3000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 更新初始状态
    this.updateStatus();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制（速度80）
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(80);
    }

    // 更新剩余时间显示
    this.timeRemaining = Math.max(0, (3000 - this.timer.getElapsed()) / 1000);
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(2)}秒`);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedCount++;
    this.updateStatus();

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onWin();
    }
  }

  updateStatus() {
    this.statusText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);
  }

  onWin() {
    this.gameOver = true;
    this.won = true;
    this.timer.remove();

    // 显示胜利信息
    const winText = this.add.text(400, 300, '成功！收集完成！', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    winText.setOrigin(0.5);

    this.player.setVelocity(0);
    console.log('Game Won! Collected:', this.collectedCount);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.won = false;

    // 显示失败信息
    const loseText = this.add.text(400, 300, '失败！时间到了！', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    loseText.setOrigin(0.5);

    this.player.setVelocity(0);
    console.log('Game Over! Collected:', this.collectedCount, '/', this.totalItems);
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