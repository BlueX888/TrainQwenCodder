class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
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

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

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

    // 创建UI文本
    this.timeText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.collectText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 设置3秒倒计时
    this.remainingTime = this.timeLimit;
    this.timerEvent = this.time.addEvent({
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

    // 更新剩余时间
    this.remainingTime = Math.max(0, this.timeLimit - this.timerEvent.getElapsed());
    this.updateUI();

    // 玩家移动控制（速度80）
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-80);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(80);
    }
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    
    // 更新UI
    this.updateUI();

    // 检查胜利条件
    if (this.collectedCount >= this.totalItems) {
      this.onWin();
    }
  }

  updateUI() {
    // 显示剩余时间（保留2位小数）
    const timeInSeconds = (this.remainingTime / 1000).toFixed(2);
    this.timeText.setText(`Time: ${timeInSeconds}s`);

    // 显示收集进度
    this.collectText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);
  }

  onWin() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示胜利信息
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setFill('#00ff00');

    console.log('Game Won! Collected all items in time.');
  }

  onTimeUp() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.gameWon = false;

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示失败信息
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setFill('#ff0000');

    console.log('Game Over! Time limit exceeded.');
  }
}

// 游戏配置
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
  scene: CollectGameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);