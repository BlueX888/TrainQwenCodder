class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 1000; // 每关1秒
    this.totalTimeElapsed = 0;
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    this.isGameOver = false;
    this.isGameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.isGameOver = false;
    this.isGameWon = false;
    this.currentLevel = 1;
    this.totalTimeElapsed = 0;
    this.gameStartTime = this.time.now;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建关卡指示器容器
    this.levelIndicators = [];
    for (let i = 0; i < this.maxLevel; i++) {
      const indicator = this.add.graphics();
      indicator.x = 200 + i * 80;
      indicator.y = 100;
      this.levelIndicators.push(indicator);
    }

    // 创建倒计时条背景
    this.timerBarBg = this.add.graphics();
    this.timerBarBg.fillStyle(0x333333, 1);
    this.timerBarBg.fillRect(200, 200, 400, 30);

    // 创建倒计时条
    this.timerBar = this.add.graphics();

    // 创建文本显示
    this.levelText = this.add.text(400, 280, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 350, 'Press SPACE to complete level', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 420, '', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '36px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    this.totalTimeText = this.add.text(400, 360, '', {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    this.restartText = this.add.text(400, 450, 'Press R to restart', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // 键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    this.levelStartTime = this.time.now;
    
    // 移除旧的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    this.updateUI();
  }

  onLevelTimeout() {
    if (!this.isGameOver && !this.isGameWon) {
      this.isGameOver = true;
      this.showGameOver(false);
    }
  }

  completeLevel() {
    if (this.isGameOver || this.isGameWon) return;

    // 移除当前计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 检查是否通关所有关卡
    if (this.currentLevel >= this.maxLevel) {
      this.isGameWon = true;
      this.totalTimeElapsed = this.time.now - this.gameStartTime;
      this.showGameOver(true);
    } else {
      // 进入下一关
      this.currentLevel++;
      this.startLevel();
    }
  }

  showGameOver(won) {
    this.instructionText.setVisible(false);
    this.levelText.setVisible(false);
    this.timerText.setVisible(false);

    if (won) {
      this.resultText.setText('VICTORY!');
      this.resultText.setColor('#00ff00');
      this.totalTimeText.setText(`Total Time: ${(this.totalTimeElapsed / 1000).toFixed(3)}s`);
    } else {
      this.resultText.setText('FAILED!');
      this.resultText.setColor('#ff0000');
      this.totalTimeText.setText(`Reached Level ${this.currentLevel} of ${this.maxLevel}`);
    }

    this.resultText.setVisible(true);
    this.totalTimeText.setVisible(true);
    this.restartText.setVisible(true);
  }

  updateUI() {
    // 更新关卡指示器
    for (let i = 0; i < this.maxLevel; i++) {
      const indicator = this.levelIndicators[i];
      indicator.clear();
      
      if (i < this.currentLevel - 1) {
        // 已完成的关卡 - 绿色
        indicator.fillStyle(0x00ff00, 1);
        indicator.fillCircle(0, 0, 25);
      } else if (i === this.currentLevel - 1) {
        // 当前关卡 - 黄色
        indicator.fillStyle(0xffff00, 1);
        indicator.fillCircle(0, 0, 25);
      } else {
        // 未完成的关卡 - 灰色
        indicator.fillStyle(0x666666, 1);
        indicator.fillCircle(0, 0, 25);
      }
      
      // 绘制关卡数字
      indicator.fillStyle(0x000000, 1);
      indicator.fillCircle(0, 0, 18);
    }

    // 更新文本
    this.levelText.setText(`Level ${this.currentLevel} / ${this.maxLevel}`);
  }

  updateTimerBar() {
    if (this.isGameOver || this.isGameWon) return;

    const elapsed = this.time.now - this.levelStartTime;
    const remaining = Math.max(0, this.levelTimeLimit - elapsed);
    const progress = remaining / this.levelTimeLimit;

    // 更新倒计时条
    this.timerBar.clear();
    
    // 根据剩余时间改变颜色
    let color = 0x00ff00; // 绿色
    if (progress < 0.3) {
      color = 0xff0000; // 红色
    } else if (progress < 0.6) {
      color = 0xffaa00; // 橙色
    }
    
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRect(200, 200, 400 * progress, 30);

    // 更新倒计时文本
    this.timerText.setText(`Time: ${(remaining / 1000).toFixed(3)}s`);
  }

  update(time, delta) {
    // 更新倒计时显示
    this.updateTimerBar();

    // 处理空格键完成关卡
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (!this.isGameOver && !this.isGameWon) {
        this.completeLevel();
      }
    }

    // 处理重启
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      if (this.isGameOver || this.isGameWon) {
        this.scene.restart();
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  // 可验证的状态信号
  callbacks: {
    postBoot: function(game) {
      // 暴露场景状态供外部验证
      game.scene.scenes[0].getState = function() {
        return {
          currentLevel: this.currentLevel,
          maxLevel: this.maxLevel,
          isGameOver: this.isGameOver,
          isGameWon: this.isGameWon,
          totalTimeElapsed: this.totalTimeElapsed
        };
      };
    }
  }
};

const game = new Phaser.Game(config);