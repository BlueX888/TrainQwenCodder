class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalStartTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录游戏开始时间
    this.totalStartTime = this.time.now;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.titleText = this.add.text(400, 50, 'Level 1 / 5', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(400, 100, 'Time: 0.500s', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建总用时显示（初始隐藏）
    this.totalTimeText = this.add.text(400, 150, '', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(400, 250, 'Click the GREEN target within 0.5s!', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 350, '', {
      fontSize: '28px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建重启提示（初始隐藏）
    this.restartText = this.add.text(400, 400, '', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    // 更新关卡显示
    this.titleText.setText(`Level ${this.currentLevel} / ${this.maxLevel}`);
    this.hintText.setText('Click the GREEN target within 0.5s!');
    this.resultText.setText('');
    this.restartText.setText('');

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 移除旧目标（如果存在）
    if (this.target) {
      this.target.destroy();
    }

    // 创建目标区域（绿色圆形）
    const targetX = Phaser.Math.Between(150, 650);
    const targetY = Phaser.Math.Between(300, 500);
    const targetRadius = 40;

    this.target = this.add.graphics();
    this.target.fillStyle(0x00ff00, 1);
    this.target.fillCircle(targetX, targetY, targetRadius);
    this.target.setInteractive(
      new Phaser.Geom.Circle(targetX, targetY, targetRadius),
      Phaser.Geom.Circle.Contains
    );

    // 添加目标点击事件
    this.target.once('pointerdown', () => {
      this.onTargetClicked();
    });

    // 启动关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });
  }

  onTargetClicked() {
    if (this.gameOver || this.gameWon) return;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 销毁目标
    if (this.target) {
      this.target.destroy();
    }

    // 检查是否完成所有关卡
    if (this.currentLevel >= this.maxLevel) {
      this.onGameWon();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(200, () => {
        this.startLevel();
      });
    }
  }

  onLevelTimeout() {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;

    // 销毁目标
    if (this.target) {
      this.target.destroy();
    }

    // 显示失败信息
    this.resultText.setText('TIME OUT! GAME OVER');
    this.resultText.setColor('#ff0000');
    this.hintText.setText('');
    
    this.restartText.setText('Click anywhere to restart');

    // 添加重启功能
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  onGameWon() {
    this.gameWon = true;

    // 计算总用时
    const totalTime = this.time.now - this.totalStartTime;
    const totalSeconds = (totalTime / 1000).toFixed(3);

    // 显示胜利信息
    this.resultText.setText('ALL LEVELS CLEARED!');
    this.resultText.setColor('#00ff00');
    this.totalTimeText.setText(`Total Time: ${totalSeconds}s`);
    this.hintText.setText('');

    this.restartText.setText('Click anywhere to play again');

    // 添加重启功能
    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  resetGame() {
    this.currentLevel = 1;
    this.gameOver = false;
    this.gameWon = false;
    this.totalStartTime = 0;
    this.levelStartTime = 0;
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }
  }

  update(time, delta) {
    // 更新倒计时显示
    if (!this.gameOver && !this.gameWon && this.levelTimer) {
      const elapsed = time - this.levelStartTime;
      const remaining = Math.max(0, this.levelTimeLimit - elapsed);
      const remainingSeconds = (remaining / 1000).toFixed(3);
      this.timerText.setText(`Time: ${remainingSeconds}s`);

      // 时间紧迫时变红
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }

    // 游戏结束时显示最终用时
    if (this.gameWon) {
      const totalTime = time - this.totalStartTime;
      const totalSeconds = (totalTime / 1000).toFixed(3);
      this.totalTimeText.setText(`Total Time: ${totalSeconds}s`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 可验证的状态信号
game.events.on('ready', () => {
  const scene = game.scene.scenes[0];
  console.log('Game State:', {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    levelTimeLimit: scene.levelTimeLimit,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon
  });
});