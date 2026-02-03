class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.timeLimit = 3000; // 3秒
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
    this.player.body.setMaxVelocity(240, 240);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品位置
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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, '剩余时间: 3.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);

    // 创建3秒倒计时
    this.startTime = this.time.now;
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新倒计时显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
    this.timerText.setText(`剩余时间: ${remaining.toFixed(1)}s`);

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-240);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(240);
    }

    // 对角线移动时标准化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(normalized.x * 240, normalized.y * 240);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onGameWin();
    }
  }

  onGameWin() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.resultText.setText('成功！');
    this.resultText.setFill('#00ff00');
    this.timerEvent.remove();
    
    console.log('Game Won! Collected all items in time.');
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    this.resultText.setText('失败！超时');
    this.resultText.setFill('#ff0000');
    
    console.log('Game Over! Time ran out.');
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