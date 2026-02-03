// 游戏状态信号
window.__signals__ = {
  currentLevel: 1,
  timeRemaining: 2.0,
  totalTime: 0,
  gameStatus: 'playing', // playing, failed, completed
  levelsPassed: 0
};

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevels = 12;
    this.levelTimeLimit = 2000; // 2秒（毫秒）
    this.totalTimeElapsed = 0;
    this.levelStartTime = 0;
    this.timer = null;
    this.player = null;
    this.target = null;
    this.cursors = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    this.levelStartTime = this.time.now;
    
    // 创建UI文本
    this.levelText = this.add.text(20, 20, `Level: ${this.currentLevel}/${this.maxLevels}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.timerText = this.add.text(20, 50, 'Time: 2.00s', {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.totalTimeText = this.add.text(20, 80, 'Total: 0.00s', {
      fontSize: '20px',
      color: '#ffff00'
    });

    // 创建玩家（使用Graphics）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();

    this.player = this.add.rectangle(100, 300, 30, 30, 0x00ff00);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // 创建目标区域（根据关卡位置变化）
    const targetX = 100 + (this.currentLevel * 50);
    const targetY = 300 - (this.currentLevel % 3) * 100;
    
    this.target = this.add.rectangle(targetX, targetY, 40, 40, 0xff0000);
    this.physics.add.existing(this.target);

    // 添加目标提示文字
    this.add.text(this.target.x - 20, this.target.y - 60, 'GOAL', {
      fontSize: '16px',
      color: '#ff0000'
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 启动倒计时
    this.startLevelTimer();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.target, this.levelComplete, null, this);

    // 更新信号
    this.updateSignals();
  }

  startLevelTimer() {
    // 清除旧计时器
    if (this.timer) {
      this.timer.remove();
    }

    // 创建新的倒计时
    this.timer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.levelFailed,
      callbackScope: this,
      loop: false
    });
  }

  levelComplete() {
    if (this.timer) {
      // 计算本关用时
      const levelTime = this.time.now - this.levelStartTime;
      this.totalTimeElapsed += levelTime;

      this.timer.remove();
      this.timer = null;

      // 更新信号
      window.__signals__.levelsPassed = this.currentLevel;
      window.__signals__.totalTime = this.totalTimeElapsed / 1000;

      if (this.currentLevel >= this.maxLevels) {
        // 通关
        this.gameComplete();
      } else {
        // 进入下一关
        this.currentLevel++;
        window.__signals__.currentLevel = this.currentLevel;
        this.scene.restart();
      }
    }
  }

  levelFailed() {
    window.__signals__.gameStatus = 'failed';
    window.__signals__.timeRemaining = 0;
    
    // 显示失败界面
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    
    const failText = this.add.text(400, 250, 'TIME OUT!', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(400, 320, `Failed at Level ${this.currentLevel}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 360, `Total Time: ${(this.totalTimeElapsed / 1000).toFixed(2)}s`, {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(400, 420, 'Click to Restart', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.resetGame();
    });

    // 禁用玩家移动
    this.cursors = null;
  }

  gameComplete() {
    window.__signals__.gameStatus = 'completed';
    window.__signals__.currentLevel = this.maxLevels;
    
    // 显示胜利界面
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    this.add.text(400, 200, 'CONGRATULATIONS!', {
      fontSize: '48px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(400, 270, `All ${this.maxLevels} Levels Completed!`, {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 330, `Total Time: ${(this.totalTimeElapsed / 1000).toFixed(2)}s`, {
      fontSize: '32px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(400, 380, `Average: ${(this.totalTimeElapsed / this.maxLevels / 1000).toFixed(2)}s per level`, {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(400, 450, 'Click to Restart', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.resetGame();
    });
  }

  resetGame() {
    this.currentLevel = 1;
    this.totalTimeElapsed = 0;
    window.__signals__.currentLevel = 1;
    window.__signals__.totalTime = 0;
    window.__signals__.gameStatus = 'playing';
    window.__signals__.levelsPassed = 0;
    this.scene.restart();
  }

  update(time, delta) {
    if (!this.cursors || !this.player.body) return;

    // 玩家移动控制
    const speed = 200;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    // 更新倒计时显示
    if (this.timer) {
      const remaining = this.timer.getRemaining() / 1000;
      this.timerText.setText(`Time: ${remaining.toFixed(2)}s`);
      
      // 时间紧迫时变红
      if (remaining < 0.5) {
        this.timerText.setColor('#ff0000');
      } else if (remaining < 1.0) {
        this.timerText.setColor('#ffaa00');
      } else {
        this.timerText.setColor('#00ff00');
      }

      window.__signals__.timeRemaining = remaining;
    }

    // 更新总用时显示
    const currentTotal = this.totalTimeElapsed + (this.time.now - this.levelStartTime);
    this.totalTimeText.setText(`Total: ${(currentTotal / 1000).toFixed(2)}s`);

    this.updateSignals();
  }

  updateSignals() {
    window.__signals__.currentLevel = this.currentLevel;
    if (this.timer) {
      window.__signals__.timeRemaining = this.timer.getRemaining() / 1000;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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

// 输出初始状态日志
console.log('Game started:', JSON.stringify(window.__signals__, null, 2));