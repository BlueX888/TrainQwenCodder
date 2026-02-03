class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 5;
    this.gameOver = false;
    this.timeLimit = 8000; // 8秒
    this.playerSpeed = 300;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(16, 16, 16);
    itemGraphics.generateTexture('item', 32, 32);
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
    
    // 在随机位置生成物品
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 8.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 50, `Collected: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.resultText.setOrigin(0.5);

    // 启动倒计时
    this.startTime = this.time.now;
    this.timerEvent = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      this.player.setVelocity(0, 0);
      return;
    }

    // 更新倒计时显示
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
    this.timerText.setText(`Time: ${remaining.toFixed(1)}s`);

    // 玩家移动控制
    this.player.setVelocity(0, 0);

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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }
  }

  collectItem(player, item) {
    // 销毁收集到的物品
    item.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    this.scoreText.setText(`Collected: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onSuccess();
    }
  }

  onSuccess() {
    this.gameOver = true;
    this.timerEvent.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setFill('#00ff00');
    
    console.log('Game Status: SUCCESS');
    console.log('Final Score:', this.collectedCount, '/', this.totalItems);
  }

  onTimeUp() {
    if (this.gameOver) return;
    
    this.gameOver = true;
    
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setFill('#ff0000');
    
    console.log('Game Status: FAILED');
    console.log('Final Score:', this.collectedCount, '/', this.totalItems);
  }
}

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

new Phaser.Game(config);