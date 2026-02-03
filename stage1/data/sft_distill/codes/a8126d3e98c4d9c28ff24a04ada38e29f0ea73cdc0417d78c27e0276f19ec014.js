class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.collectibles = null;
    this.cursors = null;
    this.saveKey = null;
    this.loadKey = null;
    this.playerSpeed = 200;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectGraphics = this.add.graphics();
    collectGraphics.fillStyle(0xffff00, 1);
    collectGraphics.fillRect(0, 0, 20, 20);
    collectGraphics.generateTexture('collectible', 20, 20);
    collectGraphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    this.spawnCollectibles();

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 50, 'Arrow Keys: Move | S: Save | L: Load', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    });

    this.feedbackText = this.add.text(400, 550, '', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });
    this.feedbackText.setOrigin(0.5);

    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.loadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    // 监听按键事件
    this.saveKey.on('down', () => {
      this.saveGame();
    });

    this.loadKey.on('down', () => {
      this.loadGame();
    });

    // 尝试自动加载存档
    this.checkForSavedGame();
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  spawnCollectibles() {
    // 使用固定种子生成收集物位置
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { x: 400, y: 500 }
    ];

    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setData('value', 10);
    });
  }

  collectItem(player, collectible) {
    // 收集物品
    const value = collectible.getData('value');
    this.score += value;
    this.updateScore();
    collectible.destroy();

    // 显示反馈
    this.showFeedback(`+${value} points!`, '#ffff00');

    // 如果所有收集物都被收集，重新生成
    if (this.collectibles.countActive(true) === 0) {
      this.time.delayedCall(1000, () => {
        this.spawnCollectibles();
        this.showFeedback('New collectibles spawned!', '#00ffff');
      });
    }
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  saveGame() {
    // 创建存档数据
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now(),
      collectiblesData: []
    };

    // 保存当前收集物状态
    this.collectibles.children.entries.forEach(collectible => {
      if (collectible.active) {
        saveData.collectiblesData.push({
          x: collectible.x,
          y: collectible.y,
          value: collectible.getData('value')
        });
      }
    });

    // 保存到 localStorage
    try {
      localStorage.setItem('phaserGameSave', JSON.stringify(saveData));
      this.showFeedback('Game Saved!', '#00ff00');
      console.log('Game saved:', saveData);
    } catch (error) {
      this.showFeedback('Save Failed!', '#ff0000');
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const savedData = localStorage.getItem('phaserGameSave');
      
      if (!savedData) {
        this.showFeedback('No save found!', '#ff9900');
        return;
      }

      const saveData = JSON.parse(savedData);

      // 恢复玩家位置
      this.player.setPosition(saveData.playerX, saveData.playerY);
      this.player.setVelocity(0, 0);

      // 恢复分数
      this.score = saveData.score;
      this.updateScore();

      // 清除当前收集物
      this.collectibles.clear(true, true);

      // 恢复收集物状态
      saveData.collectiblesData.forEach(data => {
        const collectible = this.collectibles.create(data.x, data.y, 'collectible');
        collectible.setData('value', data.value);
      });

      this.showFeedback('Game Loaded!', '#00ff00');
      console.log('Game loaded:', saveData);
    } catch (error) {
      this.showFeedback('Load Failed!', '#ff0000');
      console.error('Load error:', error);
    }
  }

  checkForSavedGame() {
    // 检查是否存在存档
    const savedData = localStorage.getItem('phaserGameSave');
    if (savedData) {
      try {
        const saveData = JSON.parse(savedData);
        const saveDate = new Date(saveData.timestamp);
        this.showFeedback(
          `Save found from ${saveDate.toLocaleString()}. Press L to load.`,
          '#00ffff',
          3000
        );
      } catch (error) {
        console.error('Error reading save:', error);
      }
    }
  }

  showFeedback(message, color = '#00ff00', duration = 2000) {
    // 显示反馈信息
    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1);

    // 淡出效果
    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      duration: duration,
      delay: 500,
      ease: 'Power2'
    });
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
new Phaser.Game(config);