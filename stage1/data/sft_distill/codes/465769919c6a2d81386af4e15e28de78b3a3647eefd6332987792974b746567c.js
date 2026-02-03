class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 5;
    this.timeRemaining = 5;
    this.gameOver = false;
    this.gameResult = ''; // 'win' or 'fail'
  }

  preload() {
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
  }

  create() {
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
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 200, y: 300 },
      { x: 600, y: 300 }
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
    this.timerText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建倒计时定时器
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 更新初始显示
    this.updateUI();
  }

  update() {
    if (this.gameOver) {
      return;
    }

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
    item.destroy();
    this.collectedCount++;
    this.updateUI();

    // 检查胜利条件
    if (this.collectedCount >= this.totalItems) {
      this.endGame('win');
    }
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    this.timeRemaining--;
    this.updateUI();

    // 检查失败条件
    if (this.timeRemaining <= 0) {
      this.endGame('fail');
    }
  }

  updateUI() {
    this.timerText.setText(`时间: ${this.timeRemaining}秒`);
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);
  }

  endGame(result) {
    this.gameOver = true;
    this.gameResult = result;
    this.timer.remove();
    this.player.setVelocity(0);

    if (result === 'win') {
      this.resultText.setText('胜利！');
      this.resultText.setStyle({ fill: '#00ff00' });
    } else {
      this.resultText.setText('失败！超时');
      this.resultText.setStyle({ fill: '#ff0000' });
    }

    this.resultText.setVisible(true);

    // 添加重启提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(400, 360, '点击重新开始', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      restartText.setOrigin(0.5);
      
      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
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