class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.items = null;
    this.cursors = null;
    this.timerEvent = null;
    this.timeText = null;
    this.itemsCollected = 0;
    this.totalItems = 5;
    this.gameOver = false;
    this.timeLimit = 15; // 15秒限制
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      itemsCollected: 0,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit,
      gameStatus: 'playing',
      playerSpeed: 80
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（金色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

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
      { x: 400, y: 150 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timeText = this.add.text(16, 16, `时间: ${this.timeLimit}s`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.itemText = this.add.text(16, 50, `物品: ${this.itemsCollected}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 创建15秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 每秒触发
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    console.log(JSON.stringify({
      event: 'game_start',
      timeLimit: this.timeLimit,
      totalItems: this.totalItems,
      playerSpeed: 80
    }));
  }

  updateTimer() {
    if (this.gameOver) return;

    this.timeLimit--;
    this.timeText.setText(`时间: ${this.timeLimit}s`);

    // 更新验证信号
    window.__signals__.timeRemaining = this.timeLimit;

    if (this.timeLimit <= 0) {
      this.gameFail();
    }
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 移除物品
    item.destroy();
    this.itemsCollected++;

    // 更新UI
    this.itemText.setText(`物品: ${this.itemsCollected}/${this.totalItems}`);

    // 更新验证信号
    window.__signals__.itemsCollected = this.itemsCollected;

    console.log(JSON.stringify({
      event: 'item_collected',
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit
    }));

    // 检查是否收集完所有物品
    if (this.itemsCollected >= this.totalItems) {
      this.gameWin();
    }
  }

  gameWin() {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    
    this.statusText.setText('成功！收集完成！');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 更新验证信号
    window.__signals__.gameStatus = 'win';

    console.log(JSON.stringify({
      event: 'game_win',
      itemsCollected: this.itemsCollected,
      timeRemaining: this.timeLimit
    }));
  }

  gameFail() {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    
    this.statusText.setText('失败！时间到！');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 更新验证信号
    window.__signals__.gameStatus = 'fail';

    console.log(JSON.stringify({
      event: 'game_fail',
      itemsCollected: this.itemsCollected,
      totalItems: this.totalItems,
      reason: 'timeout'
    }));
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0);

    // 玩家移动控制，速度为80
    const speed = 80;

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
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);