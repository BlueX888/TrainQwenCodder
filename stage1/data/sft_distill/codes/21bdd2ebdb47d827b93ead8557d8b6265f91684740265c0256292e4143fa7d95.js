class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 8000; // 8秒
    this.timeRemaining = 8;
    this.gameOver = false;
    this.gameSuccess = false;
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
    itemGraphics.fillRect(0, 0, 20, 20);
    itemGraphics.generateTexture('item', 20, 20);
    itemGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(16);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 8.0s', {
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

    // 创建8秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 创建更新计时器显示的事件（每100ms更新一次）
    this.displayTimer = this.time.addEvent({
      delay: 100,
      callback: this.updateTimerDisplay,
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
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-240);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(240);
    }

    // 归一化对角线移动速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(240);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    
    // 更新UI
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onGameSuccess();
    }
  }

  updateTimerDisplay() {
    if (this.gameOver) {
      return;
    }

    // 计算剩余时间
    const remaining = this.timerEvent.getRemaining();
    this.timeRemaining = (remaining / 1000).toFixed(1);
    this.timerText.setText(`Time: ${this.timeRemaining}s`);
  }

  onGameSuccess() {
    this.gameOver = true;
    this.gameSuccess = true;
    
    // 停止计时器
    this.timerEvent.remove();
    this.displayTimer.remove();
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 显示成功信息
    this.resultText.setText('SUCCESS!');
    this.resultText.setFill('#00ff00');
    this.resultText.setVisible(true);
    
    console.log('Game Success! Collected all items in time.');
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameSuccess = false;
    
    // 停止显示计时器
    this.displayTimer.remove();
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 显示失败信息
    this.resultText.setText('FAILED!');
    this.resultText.setFill('#ff0000');
    this.resultText.setVisible(true);
    
    this.timerText.setText('Time: 0.0s');
    
    console.log(`Game Failed! Only collected ${this.collectedCount}/${this.totalItems} items.`);
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