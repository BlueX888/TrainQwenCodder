class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.totalItems = 8;
    this.timeLimit = 12000; // 12秒
    this.timeRemaining = 12;
    this.gameOver = false;
    this.playerSpeed = 80;
  }

  preload() {
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
  }

  create() {
    // 重置游戏状态
    this.score = 0;
    this.timeRemaining = 12;
    this.gameOver = false;

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 在场景中随机分布物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 200, y: 300 },
      { x: 600, y: 300 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
    });

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, `时间: ${this.timeRemaining}s`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);

    // 创建12秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 每秒更新显示
    this.time.addEvent({
      delay: 100,
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
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.score >= this.totalItems) {
      this.onWin();
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining = Math.max(0, (this.timeLimit - this.timerEvent.getElapsed()) / 1000);
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}s`);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    // 如果时间到了但还没收集完所有物品，则失败
    if (this.score < this.totalItems) {
      this.onLose();
    }
  }

  onWin() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.resultText.setText('胜利！');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 3秒后重新开始
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  onLose() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.resultText.setText('失败！超时');
    this.resultText.setStyle({ fill: '#ff0000' });

    // 3秒后重新开始
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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