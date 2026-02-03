class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeLimit = 12;
    this.timeRemaining = 12;
    this.gameOver = false;
    this.won = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成8个物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timeText = this.add.text(16, 16, `Time: ${this.timeLimit}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `Collected: ${this.score}/${this.totalItems}`, {
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

    // 创建倒计时定时器（每秒触发）
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制（速度360）
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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(360);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Collected: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    this.timeRemaining--;
    this.timeText.setText(`Time: ${this.timeRemaining}s`);

    // 时间用完
    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.won = true;
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    console.log('Game Won! Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.won = false;
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

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