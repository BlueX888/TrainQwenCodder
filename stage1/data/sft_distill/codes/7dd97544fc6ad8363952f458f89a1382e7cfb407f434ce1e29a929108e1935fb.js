class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeRemaining = 12;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
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
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

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
      item.setCircle(12);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining}秒`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
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

    // 玩家移动控制，速度240
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

    // 检查胜利条件
    if (this.score >= this.totalItems && !this.gameOver) {
      this.winGame();
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 更新分数
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}秒`);

    // 时间警告（剩余3秒时变红）
    if (this.timeRemaining <= 3) {
      this.timerText.setColor('#ff0000');
    }

    // 超时失败
    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.resultText.setText('胜利！\n收集完成！');
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.resultText.setText('失败！\n时间到了！');
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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