class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.coins = null;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
    this.saveSlotKey = 'phaser_save_slot_1';
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    this.createPlayerTexture();
    
    // 创建金币纹理
    this.createCoinTexture();
    
    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setScale(1);
    
    // 创建金币组
    this.coins = this.physics.add.group();
    this.spawnCoins();
    
    // 添加物理系统
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
    // 金币碰撞检测
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    
    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建操作提示
    const instructions = this.add.text(400, 550, 
      'Arrow Keys: Move | SPACE: Save | L: Load', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setOrigin(0.5, 0.5);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    
    // 键盘事件监听
    this.saveKey.on('down', () => {
      this.saveGame();
    });
    
    this.loadKey.on('down', () => {
      this.loadGame();
    });
    
    // 尝试自动加载存档（可选）
    this.showStatus('Game Started! Collect coins!', 2000);
  }

  update(time, delta) {
    // 玩家移动
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    } else {
      this.player.body.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    } else {
      this.player.body.setVelocityY(0);
    }
    
    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    
    // 绘制玩家（蓝色方块带边框）
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 32, 32);
    
    // 绘制眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 4);
    graphics.fillCircle(22, 12, 4);
    
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(10, 12, 2);
    graphics.fillCircle(22, 12, 2);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createCoinTexture() {
    const graphics = this.add.graphics();
    
    // 绘制金币（黄色圆形）
    graphics.fillStyle(0xffdd00, 1);
    graphics.fillCircle(12, 12, 12);
    
    graphics.lineStyle(2, 0xff8800, 1);
    graphics.strokeCircle(12, 12, 12);
    
    // 添加内部细节
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(12, 12, 8);
    
    graphics.generateTexture('coin', 24, 24);
    graphics.destroy();
  }

  spawnCoins() {
    // 生成随机位置的金币
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 500 }
    ];
    
    positions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setScale(1);
      
      // 添加闪烁动画
      this.tweens.add({
        targets: coin,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    });
  }

  collectCoin(player, coin) {
    // 收集金币
    coin.destroy();
    this.score += 10;
    
    this.showStatus('+10 Points!', 1000);
    
    // 如果所有金币被收集，重新生成
    if (this.coins.countActive() === 0) {
      this.showStatus('All coins collected! Respawning...', 2000);
      this.time.delayedCall(1000, () => {
        this.spawnCoins();
      });
    }
  }

  saveGame() {
    // 创建存档数据
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now(),
      coinsCollected: 8 - this.coins.countActive()
    };
    
    try {
      // 保存到 localStorage
      localStorage.setItem(this.saveSlotKey, JSON.stringify(saveData));
      
      this.showStatus('Game Saved Successfully!', 2000);
      console.log('Game saved:', saveData);
      
      // 视觉反馈
      this.cameras.main.flash(200, 0, 255, 0);
    } catch (error) {
      this.showStatus('Save Failed: ' + error.message, 3000);
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      // 从 localStorage 读取
      const savedDataString = localStorage.getItem(this.saveSlotKey);
      
      if (!savedDataString) {
        this.showStatus('No save data found!', 2000);
        return;
      }
      
      const saveData = JSON.parse(savedDataString);
      
      // 恢复玩家位置
      this.player.setPosition(saveData.playerX, saveData.playerY);
      
      // 恢复分数
      this.score = saveData.score;
      
      // 清除现有金币
      this.coins.clear(true, true);
      
      // 根据存档重新生成金币
      this.spawnCoins();
      const coinsToRemove = saveData.coinsCollected || 0;
      const coinsArray = this.coins.getChildren();
      for (let i = 0; i < Math.min(coinsToRemove, coinsArray.length); i++) {
        coinsArray[i].destroy();
      }
      
      this.showStatus('Game Loaded Successfully!', 2000);
      console.log('Game loaded:', saveData);
      
      // 视觉反馈
      this.cameras.main.flash(200, 0, 0, 255);
    } catch (error) {
      this.showStatus('Load Failed: ' + error.message, 3000);
      console.error('Load error:', error);
    }
  }

  showStatus(message, duration) {
    this.statusText.setText(message);
    
    // 清除之前的定时器
    if (this.statusTimer) {
      this.statusTimer.remove();
    }
    
    // 设置新的定时器来清除消息
    this.statusTimer = this.time.delayedCall(duration, () => {
      this.statusText.setText('');
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