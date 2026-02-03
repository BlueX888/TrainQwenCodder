class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.gameOver = false;
    this.timeRemaining = 3;
    this.gameResult = null; // 'success' or 'failed'
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
    
    // 随机生成物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    for (let i = 0; i < this.totalItems; i++) {
      const item = this.items.create(positions[i].x, positions[i].y, 'item');
      item.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 3.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);

    // 创建3秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 3000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 用于更新倒计时显示
    this.startTime = this.time.now;
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onSuccess();
    }
  }

  onSuccess() {
    this.gameOver = true;
    this.gameResult = 'success';
    this.player.setVelocity(0, 0);
    this.resultText.setText('SUCCESS!');
    this.resultText.setColor('#00ff00');
    this.timerEvent.remove();
    
    console.log('Game Result: SUCCESS');
    console.log(`Collected: ${this.collectedCount}/${this.totalItems}`);
    console.log(`Time Remaining: ${this.timeRemaining.toFixed(2)}s`);
  }

  onTimeUp() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.gameResult = 'failed';
    this.player.setVelocity(0, 0);
    this.resultText.setText('TIME UP! FAILED!');
    this.resultText.setColor('#ff0000');
    
    console.log('Game Result: FAILED');
    console.log(`Collected: ${this.collectedCount}/${this.totalItems}`);
    console.log('Time Remaining: 0.00s');
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新倒计时显示
    const elapsed = (time - this.startTime) / 1000;
    this.timeRemaining = Math.max(0, 3 - elapsed);
    this.timerText.setText(`Time: ${this.timeRemaining.toFixed(2)}s`);

    // 玩家移动控制（速度240）
    const speed = 240;
    
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