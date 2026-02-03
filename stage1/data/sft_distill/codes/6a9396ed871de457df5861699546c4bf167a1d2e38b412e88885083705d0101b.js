class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 6;
    this.timeLimit = 5000; // 5秒
    this.gameOver = false;
    this.gameResult = ''; // 'win' or 'lose'
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
    
    // 随机生成物品位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 400, y: 500 }
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
    this.timeText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, '', {
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
    this.startTime = this.time.now;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.updateUI();
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制（速度200）
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新剩余时间显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, this.timeLimit - elapsed);
    const seconds = (remaining / 1000).toFixed(2);
    this.timeText.setText(`Time: ${seconds}s`);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedCount++;
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onWin();
    }
  }

  updateUI() {
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);
  }

  onWin() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.gameResult = 'win';
    this.player.setVelocity(0);
    
    // 停止计时器
    if (this.timer) {
      this.timer.remove();
    }

    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setFill('#00ff00');
    
    console.log('Game Result: WIN');
    console.log('Collected:', this.collectedCount);
    console.log('Time remaining:', this.timer.getRemaining() / 1000, 's');
  }

  onTimeUp() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.gameResult = 'lose';
    this.player.setVelocity(0);

    this.resultText.setText('TIME UP!\nYou Failed!');
    this.resultText.setFill('#ff0000');
    this.timeText.setText('Time: 0.00s');
    
    console.log('Game Result: LOSE');
    console.log('Collected:', this.collectedCount, '/', this.totalItems);
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