class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeLimit = 8000; // 8秒
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
    playerGraphics.fillRect(0, 0, 32, 32);
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

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, '剩余时间: 8.0秒', {
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

    // 创建倒计时器
    this.startTime = this.time.now;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });

    console.log('游戏开始：8秒内收集所有物品');
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新倒计时显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
    this.timerText.setText(`剩余时间: ${remaining.toFixed(1)}秒`);

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(300);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    console.log(`收集物品！当前进度: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.gameWon = true;
      this.endGame(true);
    }
  }

  timeUp() {
    if (!this.gameOver) {
      this.endGame(false);
    }
  }

  endGame(won) {
    this.gameOver = true;
    this.player.setVelocity(0);

    // 移除定时器
    if (this.timer) {
      this.timer.remove();
    }

    // 显示结果
    if (won) {
      this.resultText.setText('成功！\n收集完成！');
      this.resultText.setFill('#00ff00');
      console.log('游戏胜利：成功收集所有物品！');
    } else {
      this.resultText.setText('失败！\n时间到了！');
      this.resultText.setFill('#ff0000');
      console.log('游戏失败：超时未收集完所有物品');
    }
    
    this.resultText.setVisible(true);

    // 输出最终状态
    console.log(`最终分数: ${this.score}/${this.totalItems}`);
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