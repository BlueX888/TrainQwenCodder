class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeLimit = 5000; // 5秒
    this.timeRemaining = 5000;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
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

    // 创建5秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 提示文本
    this.add.text(400, 580, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#888888'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新剩余时间显示
    this.timeRemaining = Math.max(0, this.timeLimit - this.timerEvent.getElapsed());
    this.timerText.setText(`Time: ${(this.timeRemaining / 1000).toFixed(1)}s`);

    // 玩家移动控制
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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(120);
    }
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText(`Collected: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.onGameWin();
    }
  }

  onGameWin() {
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示胜利信息
    this.resultText.setText('SUCCESS!\nAll Items Collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);

    console.log('Game Won! Score:', this.score, 'Time Remaining:', (this.timeRemaining / 1000).toFixed(1) + 's');
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameWon = false;

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示失败信息
    this.resultText.setText('TIME UP!\nFailed!');
    this.resultText.setStyle({ fill: '#ff0000' });
    this.resultText.setVisible(true);

    console.log('Game Over! Score:', this.score, '/', this.totalItems);
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);