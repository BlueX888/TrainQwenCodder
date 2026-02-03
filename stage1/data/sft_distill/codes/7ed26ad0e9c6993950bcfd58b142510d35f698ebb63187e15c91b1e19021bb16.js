class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timeText = null;
    this.scoreText = null;
    this.resultText = null;
    this.timer = null;
    this.timeLeft = 8;
    this.totalItems = 5;
    this.collectedItems = 0;
    this.gameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      gameStarted: true,
      timeLeft: 8,
      totalItems: this.totalItems,
      collectedItems: 0,
      gameOver: false,
      result: null
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
    this.timeText = this.add.text(16, 16, 'Time: 8s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Items: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 创建倒计时器（8秒）
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timeLimit: 8,
      totalItems: this.totalItems,
      playerSpeed: 200
    }));
  }

  update() {
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
  }

  collectItem(player, item) {
    item.destroy();
    this.collectedItems++;
    
    this.scoreText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);

    // 更新验证信号
    window.__signals__.collectedItems = this.collectedItems;

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems,
      timeLeft: this.timeLeft
    }));

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.winGame();
    }
  }

  updateTimer() {
    this.timeLeft--;
    this.timeText.setText(`Time: ${this.timeLeft}s`);

    // 更新验证信号
    window.__signals__.timeLeft = this.timeLeft;

    console.log(JSON.stringify({
      event: 'timer_update',
      timeLeft: this.timeLeft
    }));

    // 时间到，检查是否完成
    if (this.timeLeft <= 0) {
      this.timer.remove();
      if (this.collectedItems < this.totalItems) {
        this.loseGame();
      }
    }
  }

  winGame() {
    this.gameOver = true;
    this.timer.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    this.player.setVelocity(0);

    // 更新验证信号
    window.__signals__.gameOver = true;
    window.__signals__.result = 'success';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'success',
      collectedItems: this.collectedItems,
      timeLeft: this.timeLeft
    }));
  }

  loseGame() {
    this.gameOver = true;
    
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setStyle({ fill: '#ff0000' });
    
    this.player.setVelocity(0);

    // 更新验证信号
    window.__signals__.gameOver = true;
    window.__signals__.result = 'failed';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'failed',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems
    }));
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