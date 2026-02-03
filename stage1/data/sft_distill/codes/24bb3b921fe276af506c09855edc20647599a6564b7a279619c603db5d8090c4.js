class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedItems = 0;
    this.totalItems = 5;
    this.timeLimit = 3000; // 3秒
    this.gameOver = false;
    this.gameResult = null;
  }

  preload() {
    // 使用Graphics程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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
    // 初始化signals
    window.__signals__ = {
      collectedItems: 0,
      totalItems: this.totalItems,
      timeRemaining: this.timeLimit,
      gameOver: false,
      gameResult: null,
      playerSpeed: 200
    };

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
      item.setCircle(12); // 设置碰撞体为圆形
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.itemText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建3秒倒计时
    this.timeElapsed = 0;
    this.timer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.updateUI();

    console.log(JSON.stringify({
      event: 'game_start',
      totalItems: this.totalItems,
      timeLimit: this.timeLimit,
      playerSpeed: 200
    }));
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 销毁物品
    item.destroy();
    
    // 增加收集计数
    this.collectedItems++;
    
    // 更新signals
    window.__signals__.collectedItems = this.collectedItems;

    console.log(JSON.stringify({
      event: 'item_collected',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems
    }));

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems) {
      this.onGameWin();
    }

    this.updateUI();
  }

  onGameWin() {
    this.gameOver = true;
    this.gameResult = 'success';
    
    // 停止计时器
    if (this.timer) {
      this.timer.remove();
    }

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示成功信息
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });

    // 更新signals
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'success';

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'success',
      collectedItems: this.collectedItems,
      timeRemaining: this.timeLimit - this.timeElapsed
    }));
  }

  onTimeUp() {
    if (this.gameOver) return;

    this.gameOver = true;
    this.gameResult = 'failure';

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示失败信息
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setStyle({ fill: '#ff0000' });

    // 更新signals
    window.__signals__.gameOver = true;
    window.__signals__.gameResult = 'failure';
    window.__signals__.timeRemaining = 0;

    console.log(JSON.stringify({
      event: 'game_end',
      result: 'failure',
      collectedItems: this.collectedItems,
      totalItems: this.totalItems,
      reason: 'timeout'
    }));
  }

  updateUI() {
    const timeRemaining = Math.max(0, this.timeLimit - this.timeElapsed);
    const seconds = (timeRemaining / 1000).toFixed(1);
    
    this.timerText.setText(`Time: ${seconds}s`);
    this.itemText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);
    
    // 更新signals
    window.__signals__.timeRemaining = timeRemaining;
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新时间
    this.timeElapsed += delta;
    this.updateUI();

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0, 0);

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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
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

// 创建游戏实例
new Phaser.Game(config);