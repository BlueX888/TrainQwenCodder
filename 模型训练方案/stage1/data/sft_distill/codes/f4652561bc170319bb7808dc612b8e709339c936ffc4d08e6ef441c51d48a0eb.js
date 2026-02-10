class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collected = 0;
    this.total = 8;
    this.timeRemaining = 8;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物品纹理（黄色圆形）
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
    
    // 随机生成物品
    for (let i = 0; i < this.total; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示收集进度文本
    this.progressText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.updateProgressText();

    // 显示倒计时文本
    this.timerText = this.add.text(16, 50, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    this.updateTimerText();

    // 游戏结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 设置8秒倒计时
    this.timerEvent = this.time.addEvent({
      delay: 8000,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 每100毫秒更新倒计时显示
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

    // 玩家移动控制，速度160
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();
    
    // 更新收集计数
    this.collected++;
    this.updateProgressText();

    // 检查是否收集完所有物品
    if (this.collected >= this.total) {
      this.onWin();
    }
  }

  updateProgressText() {
    this.progressText.setText(`收集: ${this.collected}/${this.total}`);
  }

  updateTimer() {
    if (this.gameOver) {
      return;
    }

    // 计算剩余时间
    this.timeRemaining = Math.max(0, 8 - this.timerEvent.getElapsed() / 1000);
    this.updateTimerText();
  }

  updateTimerText() {
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(1)}s`);
  }

  onTimeUp() {
    if (this.gameOver) {
      return;
    }

    // 检查是否已经收集完所有物品
    if (this.collected < this.total) {
      this.gameOver = true;
      this.gameWon = false;
      this.timeRemaining = 0;
      
      // 停止玩家移动
      this.player.setVelocity(0);
      
      // 显示失败文本
      this.resultText.setText('失败！超时了');
      this.resultText.setStyle({ fill: '#ff0000' });
      this.resultText.setVisible(true);
      
      console.log('Game Over: Time Up');
    }
  }

  onWin() {
    this.gameOver = true;
    this.gameWon = true;
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 移除计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    
    // 显示成功文本
    this.resultText.setText('成功！全部收集');
    this.resultText.setStyle({ fill: '#00ff00' });
    this.resultText.setVisible(true);
    
    console.log('Game Won: All items collected');
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
  scene: CollectionGame
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露游戏状态供验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    collected: scene.collected,
    total: scene.total,
    timeRemaining: scene.timeRemaining,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon
  };
};