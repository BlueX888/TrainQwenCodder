class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0;
    this.totalItems = 8;
    this.timeLimit = 5000; // 5秒
    this.timeRemaining = 5000;
    this.gameOver = false;
    this.gameResult = ''; // 'success' or 'failed'
  }

  preload() {
    // 使用Graphics创建纹理，不需要外部资源
  }

  create() {
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
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.timeText = this.add.text(16, 16, '', {
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

    // 创建5秒倒计时
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
    this.timeRemaining = Math.max(0, this.timeLimit - this.timerEvent.getElapsed());
    this.updateUI();

    // 玩家移动控制（速度120）
    const speed = 120;
    this.player.setVelocity(0);

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

  collectItem(player, item) {
    item.destroy();
    this.collectedCount++;
    this.updateUI();

    // 检查是否收集完所有物品
    if (this.collectedCount >= this.totalItems) {
      this.onSuccess();
    }
  }

  onSuccess() {
    this.gameOver = true;
    this.gameResult = 'success';
    this.player.setVelocity(0);
    this.timerEvent.remove();
    
    this.resultText.setText('SUCCESS!\nAll items collected!');
    this.resultText.setStyle({ fill: '#00ff00' });
    
    console.log('Game Result: SUCCESS');
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;
    this.gameResult = 'failed';
    this.player.setVelocity(0);
    
    this.resultText.setText('FAILED!\nTime is up!');
    this.resultText.setStyle({ fill: '#ff0000' });
    
    console.log('Game Result: FAILED');
  }

  updateUI() {
    const seconds = (this.timeRemaining / 1000).toFixed(1);
    this.timeText.setText(`Time: ${seconds}s`);
    this.itemText.setText(`Items: ${this.collectedCount}/${this.totalItems}`);
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