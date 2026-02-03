class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.timeLimit = 8;
    this.gameOver = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collectedCount: 0,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit,
      gameStatus: 'playing', // playing, success, failed
      playerSpeed: 200
    };

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
    
    // 随机生成物品位置
    const positions = this.generateItemPositions();
    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeLimit}s`, {
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
    this.timeRemaining = this.timeLimit;
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit,
      playerSpeed: 200
    }));
  }

  generateItemPositions() {
    const positions = [];
    const margin = 50;
    const minDistance = 80;

    while (positions.length < this.totalItems) {
      const x = Phaser.Math.Between(margin, 800 - margin);
      const y = Phaser.Math.Between(margin, 600 - margin);

      // 确保不与玩家初始位置太近
      if (Phaser.Math.Distance.Between(x, y, 400, 300) < 100) {
        continue;
      }

      // 确保物品之间有最小距离
      let tooClose = false;
      for (let pos of positions) {
        if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < minDistance) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        positions.push({ x, y });
      }
    }

    return positions;
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);
    
    // 更新信号
    window.__signals__.collectedCount = this.collectedCount;

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedCount: this.collectedCount,
      totalItems: this.totalItems,
      timeRemaining: this.timeRemaining
    }));

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.gameWin();
    }
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}s`);
    
    // 更新信号
    window.__signals__.timeRemaining = this.timeRemaining;

    if (this.timeRemaining <= 0) {
      this.gameLose();
    }
  }

  gameWin() {
    this.gameOver = true;
    this.timer.remove();
    
    this.resultText.setText('成功！\n收集完成！');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);

    // 更新信号
    window.__signals__.gameStatus = 'success';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'success',
      collectedCount: this.collectedCount,
      timeRemaining: this.timeRemaining
    }));

    // 停止玩家移动
    this.player.setVelocity(0, 0);
  }

  gameLose() {
    this.gameOver = true;
    this.timer.remove();
    
    this.resultText.setText('失败！\n时间到了！');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);

    // 更新信号
    window.__signals__.gameStatus = 'failed';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'failed',
      collectedCount: this.collectedCount,
      totalItems: this.totalItems
    }));

    // 停止玩家移动
    this.player.setVelocity(0, 0);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0, 0);

    // 键盘控制
    const speed = 200;

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

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
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

new Phaser.Game(config);