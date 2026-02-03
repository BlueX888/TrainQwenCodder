class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.timeLimit = 8000; // 8秒
    this.gameOver = false;
    this.success = false;
  }

  preload() {
    // 不需要加载外部资源
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

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 8.0s', {
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

    // 启动倒计时
    this.remainingTime = this.timeLimit;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 用于更新倒计时显示的定时器
    this.time.addEvent({
      delay: 100,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(360);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onSuccess();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.remainingTime = Math.max(0, this.timeLimit - this.timer.getElapsed());
    const seconds = (this.remainingTime / 1000).toFixed(1);
    this.timerText.setText(`Time: ${seconds}s`);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.success = false;
    this.player.setVelocity(0);
    
    this.resultText.setText('FAILED!\nTime\'s Up!');
    this.resultText.setStyle({ fill: '#ff0000' });

    console.log('Game Over - Failed: Time\'s up');
  }

  onSuccess() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.success = true;
    this.player.setVelocity(0);
    this.timer.remove();

    const timeUsed = ((this.timeLimit - this.remainingTime) / 1000).toFixed(1);
    this.resultText.setText(`SUCCESS!\nTime: ${timeUsed}s`);
    this.resultText.setStyle({ fill: '#00ff00' });

    console.log(`Game Over - Success: Collected all items in ${timeUsed}s`);
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