class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timeRemaining = 10;
    this.totalItems = 5;
    this.collectedItems = 0;
    this.gameOver = false;
    this.timerText = null;
    this.scoreText = null;
    this.resultText = null;
    this.timer = null;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      score: 0,
      timeRemaining: 10,
      totalItems: this.totalItems,
      collectedItems: 0,
      gameStatus: 'playing'
    };

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
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 10s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, 'Items: 0/5', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建10秒倒计时
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
      repeat: 9
    });

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: 10
    }));
  }

  updateTimer() {
    this.timeRemaining--;
    this.timerText.setText(`Time: ${this.timeRemaining}s`);
    
    window.__signals__.timeRemaining = this.timeRemaining;

    console.log(JSON.stringify({
      event: 'timer_update',
      timeRemaining: this.timeRemaining
    }));

    if (this.timeRemaining <= 0) {
      this.gameOver = true;
      this.endGame(false);
    }
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.collectedItems++;
    
    window.__signals__.collectedItems = this.collectedItems;
    window.__signals__.score = this.collectedItems * 100;

    this.scoreText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems
    }));

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.gameOver = true;
      this.endGame(true);
    }
  }

  endGame(success) {
    // 停止计时器
    if (this.timer) {
      this.timer.remove();
    }

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    if (success) {
      this.resultText.setText('SUCCESS!\nAll items collected!');
      this.resultText.setColor('#00ff00');
      window.__signals__.gameStatus = 'success';
      
      console.log(JSON.stringify({
        event: 'game_end',
        result: 'success',
        collectedItems: this.collectedItems,
        timeRemaining: this.timeRemaining
      }));
    } else {
      this.resultText.setText('FAILED!\nTime is up!');
      this.resultText.setColor('#ff0000');
      window.__signals__.gameStatus = 'failed';
      
      console.log(JSON.stringify({
        event: 'game_end',
        result: 'failed',
        collectedItems: this.collectedItems,
        timeRemaining: 0
      }));
    }
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0);

    const speed = 360;

    // 键盘控制
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