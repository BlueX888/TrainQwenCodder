class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.totalItems = 8;
    this.collectedItems = 0;
    this.timeRemaining = 5;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 随机生成物品
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.timerText = this.add.text(16, 16, 'Time: 5.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.scoreText = this.add.text(16, 50, `Items: 0/${this.totalItems}`, {
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

    // 创建5秒倒计时
    this.timer = this.time.addEvent({
      delay: 5000,
      callback: this.timeUp,
      callbackScope: this,
      loop: false
    });

    // 记录开始时间用于显示剩余时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新倒计时显示
    const elapsed = (time - this.startTime) / 1000;
    this.timeRemaining = Math.max(0, 5 - elapsed);
    this.timerText.setText(`Time: ${this.timeRemaining.toFixed(1)}s`);

    // 玩家移动控制（速度360）
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-360);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(360);
    }

    // 归一化对角线移动速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(360);
    }

    // 检查是否收集完所有物品
    if (this.collectedItems >= this.totalItems && !this.gameOver) {
      this.gameWon = true;
      this.endGame(true);
    }
  }

  collectItem(player, item) {
    // 移除物品
    item.destroy();
    
    // 增加收集计数
    this.collectedItems++;
    
    // 更新UI
    this.scoreText.setText(`Items: ${this.collectedItems}/${this.totalItems}`);

    // 添加收集音效（使用视觉反馈代替）
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.5);
    flash.fillCircle(item.x, item.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  timeUp() {
    // 时间到，检查是否收集完所有物品
    if (this.collectedItems < this.totalItems) {
      this.endGame(false);
    }
  }

  endGame(won) {
    this.gameOver = true;
    this.player.setVelocity(0);

    if (won) {
      this.resultText.setText('SUCCESS!');
      this.resultText.setStyle({ fill: '#00ff00' });
      console.log('Game Won! All items collected in time!');
    } else {
      this.resultText.setText('FAILED!');
      this.resultText.setStyle({ fill: '#ff0000' });
      console.log('Game Over! Time ran out!');
    }

    this.resultText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.resultText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 5秒后重启游戏
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