class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证状态
    this.totalItems = 10;
    this.timeRemaining = 20;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
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
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

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
      item.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
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
      fontStyle: 'bold'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建倒计时器 - 每秒更新一次
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
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 更新分数
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}秒`);

    // 时间到，检查是否失败
    if (this.timeRemaining <= 0) {
      if (this.score < this.totalItems) {
        this.loseGame();
      }
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 显示胜利信息
    this.resultText.setText('胜利！');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    console.log('Game Won! Score:', this.score, 'Time Remaining:', this.timeRemaining);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);

    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 显示失败信息
    this.resultText.setText('失败！超时');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    console.log('Game Over! Score:', this.score, '/', this.totalItems);
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