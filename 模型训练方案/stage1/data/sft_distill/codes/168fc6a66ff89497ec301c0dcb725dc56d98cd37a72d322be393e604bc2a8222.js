class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 5000; // 5秒
    this.gameOver = false;
    this.gameResult = null; // 'win' or 'lose'
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理
    const itemGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillRect(4, 4, 16, 16);
    itemGraphics.lineStyle(2, 0xffa500, 1);
    itemGraphics.strokeRect(4, 4, 16, 16);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

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
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 150, y: 300 },
      { x: 650, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 5.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建倒计时
    this.timeRemaining = this.timeLimit;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    console.log('Game started! Collect all items within 5 seconds!');
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新倒计时显示
    this.timeRemaining = Math.max(0, this.timeLimit - this.timer.getElapsed());
    this.timerText.setText(`Time: ${(this.timeRemaining / 1000).toFixed(1)}s`);

    // 玩家移动控制
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

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems && !this.gameOver) {
      this.onWin();
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 更新收集计数
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);
    
    console.log(`Item collected! Total: ${this.collectedCount}/${this.totalItems}`);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onWin();
    } else {
      this.onLose();
    }
  }

  onWin() {
    this.gameOver = true;
    this.gameResult = 'win';
    this.player.setVelocity(0);
    
    this.resultText.setText('SUCCESS!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);
    
    // 停止计时器
    if (this.timer) {
      this.timer.remove();
    }
    
    console.log('Game Result: WIN - All items collected in time!');
  }

  onLose() {
    this.gameOver = true;
    this.gameResult = 'lose';
    this.player.setVelocity(0);
    
    this.resultText.setText('TIME UP!\nFAILED!');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);
    
    console.log(`Game Result: LOSE - Only collected ${this.collectedCount}/${this.totalItems} items`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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