class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeRemaining = 5;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
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
    
    // 在随机位置生成物品
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
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI 文本
    this.timerText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    // 创建5秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 5秒后游戏结束检查
    this.time.addEvent({
      delay: 5000,
      callback: this.checkGameEnd,
      callbackScope: this
    });

    this.updateUI();
  }

  update() {
    if (this.gameOver) {
      this.player.setVelocity(0, 0);
      return;
    }

    // 重置速度
    this.player.setVelocity(0, 0);

    // 玩家移动控制，速度300
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    this.updateUI();

    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems && !this.gameOver) {
      this.gameWon = true;
      this.gameOver = true;
      this.timerEvent.remove();
      this.statusText.setText('SUCCESS!\nAll items collected!');
      this.statusText.setStyle({ fill: '#00ff00' });
    }
  }

  updateTimer() {
    this.timeRemaining--;
    this.updateUI();

    if (this.timeRemaining <= 0) {
      this.timerEvent.remove();
    }
  }

  checkGameEnd() {
    if (!this.gameOver) {
      this.gameOver = true;
      this.gameWon = false;
      this.statusText.setText('FAILED!\nTime is up!');
      this.statusText.setStyle({ fill: '#ff0000' });
    }
  }

  updateUI() {
    this.timerText.setText(`Time: ${Math.max(0, this.timeRemaining)}s`);
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);
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