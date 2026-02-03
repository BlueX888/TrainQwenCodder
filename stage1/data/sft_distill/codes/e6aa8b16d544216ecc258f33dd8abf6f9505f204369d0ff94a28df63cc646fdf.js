class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 4000; // 4秒
    this.totalTimeElapsed = 0;
    this.gameStartTime = 0;
    this.levelTimer = null;
    this.gameState = 'playing'; // playing, failed, completed
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化游戏开始时间
    this.gameStartTime = this.time.now;
    this.totalTimeElapsed = 0;
    this.currentLevel = 1;
    this.gameState = 'playing';

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建关卡显示区域
    this.levelBg = this.add.graphics();
    this.levelBg.fillStyle(0x16213e, 1);
    this.levelBg.fillRect(50, 50, 700, 150);

    // 关卡文本
    this.levelText = this.add.text(400, 100, `关卡 ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 倒计时文本
    this.timerText = this.add.text(400, 160, '剩余时间: 4.0秒', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 提示文本
    this.hintText = this.add.text(400, 300, '按空格键通过当前关卡', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 总用时文本（初始隐藏）
    this.totalTimeText = this.add.text(400, 400, '', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#00ffff'
    }).setOrigin(0.5).setVisible(false);

    // 结果文本
    this.resultText = this.add.text(400, 350, '', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 重新开始提示
    this.restartText = this.add.text(400, 500, '按 R 键重新开始', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5).setVisible(false);

    // 创建进度条背景
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x333333, 1);
    this.progressBg.fillRect(100, 250, 600, 30);

    // 创建进度条
    this.progressBar = this.add.graphics();

    // 键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 启动第一关计时器
    this.startLevelTimer();
  }

  startLevelTimer() {
    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建倒计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });
  }

  onLevelTimeout() {
    // 超时失败
    this.gameState = 'failed';
    this.showGameOver(false);
  }

  completeLevel() {
    if (this.gameState !== 'playing') return;

    // 移除当前计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 进入下一关
    this.currentLevel++;

    if (this.currentLevel > this.maxLevel) {
      // 游戏通关
      this.gameState = 'completed';
      this.totalTimeElapsed = this.time.now - this.gameStartTime;
      this.showGameOver(true);
    } else {
      // 更新关卡显示
      this.levelText.setText(`关卡 ${this.currentLevel}/${this.maxLevel}`);
      
      // 启动新关卡计时器
      this.startLevelTimer();
    }
  }

  showGameOver(success) {
    // 隐藏游戏元素
    this.hintText.setVisible(false);
    this.timerText.setVisible(false);
    this.progressBar.clear();
    this.progressBg.setVisible(false);

    if (success) {
      // 胜利
      this.resultText.setText('恭喜通关！').setColor('#00ff00').setVisible(true);
      const totalSeconds = (this.totalTimeElapsed / 1000).toFixed(2);
      this.totalTimeText.setText(`总用时: ${totalSeconds} 秒`).setVisible(true);
    } else {
      // 失败
      this.resultText.setText('挑战失败').setColor('#ff0000').setVisible(true);
      this.totalTimeText.setText(`失败于关卡 ${this.currentLevel}`).setVisible(true);
    }

    this.restartText.setVisible(true);
  }

  restartGame() {
    this.scene.restart();
  }

  update(time, delta) {
    if (this.gameState === 'playing') {
      // 检测空格键按下（通关当前关卡）
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.completeLevel();
      }

      // 更新倒计时显示
      if (this.levelTimer) {
        const remaining = this.levelTimer.getRemaining();
        const remainingSeconds = (remaining / 1000).toFixed(1);
        this.timerText.setText(`剩余时间: ${remainingSeconds}秒`);

        // 根据剩余时间改变颜色
        if (remaining < 1000) {
          this.timerText.setColor('#ff0000');
        } else if (remaining < 2000) {
          this.timerText.setColor('#ffaa00');
        } else {
          this.timerText.setColor('#00ff00');
        }

        // 更新进度条
        const progress = 1 - (remaining / this.levelTimeLimit);
        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRect(100, 250, 600 * progress, 30);
      }
    } else {
      // 游戏结束状态，检测重新开始
      if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
        this.restartGame();
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出状态变量供验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    gameState: scene.gameState,
    totalTimeElapsed: scene.totalTimeElapsed,
    remainingTime: scene.levelTimer ? scene.levelTimer.getRemaining() : 0
  };
};