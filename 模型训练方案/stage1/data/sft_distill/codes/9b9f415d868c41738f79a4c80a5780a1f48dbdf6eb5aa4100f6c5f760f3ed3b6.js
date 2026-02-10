class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 10;
    this.gameOver = false;
    this.gameWon = false;
    this.timeLimit = 12; // 12秒时间限制
    this.timeRemaining = 12;
  }

  preload() {
    // 使用 Graphics 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffdd00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 随机生成收集物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

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
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeLimit}s`, {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 创建倒计时器（每秒触发一次）
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 添加说明文本
    this.add.text(400, 570, '使用方向键或WASD移动', {
      fontSize: '16px',
      fill: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  collectItem(player, item) {
    if (this.gameOver) return;

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
    if (this.gameOver) return;

    this.timeRemaining--;
    this.timerText.setText(`时间: ${this.timeRemaining}s`);

    // 时间少于5秒时变红色警告
    if (this.timeRemaining <= 5) {
      this.timerText.setColor('#ff0000');
    }

    // 时间到了
    if (this.timeRemaining <= 0) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.gameTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示胜利文本
    this.statusText.setText('胜利！');
    this.statusText.setColor('#00ff00');
    this.statusText.setVisible(true);

    // 添加胜利效果
    this.tweens.add({
      targets: this.statusText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Won! Score:', this.score, 'Time Remaining:', this.timeRemaining);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.gameTimer.remove();

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示失败文本
    this.statusText.setText('时间到！失败');
    this.statusText.setColor('#ff0000');
    this.statusText.setVisible(true);

    // 添加失败效果
    this.tweens.add({
      targets: this.statusText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Over! Score:', this.score, '/', this.totalItems);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 重置速度
    this.player.setVelocity(0);

    // 玩家移动控制（速度360）
    const speed = 360;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
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
  backgroundColor: '#000000',
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
const game = new Phaser.Game(config);