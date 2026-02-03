class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.score = 0;
    this.scoreText = null;
    this.statusText = null;
    this.cursors = null;
    this.saveKey = null;
    this.hasSaveData = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家（使用Graphics绘制一个绿色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建玩家精灵，初始位置在中心
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5, 0.5);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建状态提示文本
    this.statusText = this.add.text(16, 50, 'Controls:\nWASD - Move\nSPACE - Add Score\nRight Click - Save\nS Key - Load', {
      fontSize: '16px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 创建存档状态指示器
    this.saveIndicator = this.add.text(16, 550, '', {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 检查是否有存档
    this.checkSaveData();

    // 设置键盘输入
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      load: Phaser.Input.Keyboard.KeyCodes.L
    });

    // 监听空格键增加分数（使用just down避免连续触发）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.addScore(10);
    });

    // 监听L键加载存档
    this.input.keyboard.on('keydown-L', () => {
      this.loadGame();
    });

    // 监听鼠标右键保存
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.saveGame();
      }
    });

    // 禁用右键菜单
    this.input.mouse.disableContextMenu();

    // 添加边界碰撞
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // 尝试自动加载存档（可选）
    const autoLoad = localStorage.getItem('phaser_save_autoload');
    if (autoLoad === 'true' && this.hasSaveData) {
      this.time.delayedCall(500, () => {
        this.showMessage('Auto-loading save data...', '#00ffff');
        this.loadGame();
      });
    }
  }

  update(time, delta) {
    // 玩家移动控制
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
  }

  addScore(points) {
    this.score += points;
    this.scoreText.setText('Score: ' + this.score);
    this.showMessage('+' + points + ' points!', '#ffff00');
  }

  saveGame() {
    // 创建存档数据对象
    const saveData = {
      playerX: this.player.x,
      playerY: this.player.y,
      score: this.score,
      timestamp: Date.now()
    };

    // 保存到localStorage
    try {
      localStorage.setItem('phaser_game_save', JSON.stringify(saveData));
      this.hasSaveData = true;
      this.showMessage('Game Saved!', '#00ff00');
      
      // 更新存档指示器
      const date = new Date(saveData.timestamp);
      this.saveIndicator.setText('Last Save: ' + date.toLocaleTimeString());
    } catch (error) {
      this.showMessage('Save Failed!', '#ff0000');
      console.error('Save error:', error);
    }
  }

  loadGame() {
    try {
      const saveDataString = localStorage.getItem('phaser_game_save');
      
      if (!saveDataString) {
        this.showMessage('No save data found!', '#ff8800');
        return;
      }

      // 解析存档数据
      const saveData = JSON.parse(saveDataString);

      // 恢复玩家位置
      this.player.setPosition(saveData.playerX, saveData.playerY);
      this.player.body.setVelocity(0, 0); // 停止移动

      // 恢复分数
      this.score = saveData.score;
      this.scoreText.setText('Score: ' + this.score);

      this.showMessage('Game Loaded!', '#00ffff');
      
      // 更新存档指示器
      const date = new Date(saveData.timestamp);
      this.saveIndicator.setText('Last Save: ' + date.toLocaleTimeString());
      
    } catch (error) {
      this.showMessage('Load Failed!', '#ff0000');
      console.error('Load error:', error);
    }
  }

  checkSaveData() {
    const saveDataString = localStorage.getItem('phaser_game_save');
    this.hasSaveData = !!saveDataString;
    
    if (this.hasSaveData) {
      try {
        const saveData = JSON.parse(saveDataString);
        const date = new Date(saveData.timestamp);
        this.saveIndicator.setText('Last Save: ' + date.toLocaleTimeString());
      } catch (error) {
        this.hasSaveData = false;
      }
    } else {
      this.saveIndicator.setText('No save data');
    }
  }

  showMessage(text, color) {
    // 创建临时消息文本
    const message = this.add.text(400, 300, text, {
      fontSize: '32px',
      fill: color,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    message.setOrigin(0.5, 0.5);

    // 添加淡出动画
    this.tweens.add({
      targets: message,
      alpha: 0,
      y: 250,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        message.destroy();
      }
    });
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
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);