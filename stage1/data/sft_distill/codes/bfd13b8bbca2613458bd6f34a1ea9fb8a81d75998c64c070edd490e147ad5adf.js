class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 2000; // 2秒
    this.totalStartTime = 0;
    this.totalElapsedTime = 0;
    this.levelTimer = null;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.totalStartTime = this.time.now;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.titleText = this.add.text(400, 50, 'Level Challenge', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建关卡信息文本
    this.levelText = this.add.text(400, 120, '', {
      fontSize: '24px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    // 创建倒计时文本
    this.timerText = this.add.text(400, 170, '', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建总用时文本（初始隐藏）
    this.totalTimeText = this.add.text(400, 220, '', {
      fontSize: '20px',
      color: '#4ecdc4'
    }).setOrigin(0.5).setVisible(false);

    // 创建提示文本
    this.hintText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#95e1d3'
    }).setOrigin(0.5);

    // 创建目标区域（玩家需要点击的区域）
    this.targetGraphics = this.add.graphics();
    
    // 创建结果文本（游戏结束时显示）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    // 更新关卡信息
    this.levelText.setText(`Level ${this.currentLevel} / ${this.maxLevel}`);
    this.hintText.setText('Click the target to proceed!');
    this.timerText.setColor('#ff6b6b');

    // 清除旧的目标
    this.targetGraphics.clear();

    // 绘制目标区域（随机位置）
    const targetX = 200 + Math.random() * 400;
    const targetY = 280 + Math.random() * 150;
    const targetRadius = 50;

    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillCircle(targetX, targetY, targetRadius);
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeCircle(targetX, targetY, targetRadius);

    // 添加目标文字
    const targetText = this.add.text(targetX, targetY, 'CLICK', {
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 设置目标可交互
    this.targetGraphics.setInteractive(
      new Phaser.Geom.Circle(targetX, targetY, targetRadius),
      Phaser.Geom.Circle.Contains
    );

    // 点击目标事件
    this.targetGraphics.once('pointerdown', () => {
      if (this.gameOver || this.gameWon) return;
      
      // 停止当前关卡计时器
      if (this.levelTimer) {
        this.levelTimer.remove();
      }

      targetText.destroy();

      // 检查是否完成所有关卡
      if (this.currentLevel >= this.maxLevel) {
        this.completeGame();
      } else {
        // 进入下一关
        this.currentLevel++;
        this.startLevel();
      }
    });

    // 创建关卡倒计时器
    this.levelStartTime = this.time.now;
    
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        this.failGame();
      },
      callbackScope: this
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 更新倒计时显示
    if (this.levelTimer) {
      const remaining = this.levelTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(2);
      this.timerText.setText(`Time: ${seconds}s`);

      // 时间不足0.5秒时变红色闪烁
      if (remaining < 500) {
        this.timerText.setColor(Math.floor(time / 100) % 2 === 0 ? '#ff0000' : '#ff6b6b');
      }
    }

    // 更新总用时显示
    if (!this.gameOver && !this.gameWon) {
      this.totalElapsedTime = time - this.totalStartTime;
    }
  }

  completeGame() {
    this.gameWon = true;
    
    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 隐藏游戏元素
    this.targetGraphics.clear();
    this.hintText.setVisible(false);

    // 计算总用时
    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);

    // 显示胜利信息
    this.resultText.setText('YOU WIN!');
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);

    this.totalTimeText.setText(`Total Time: ${totalSeconds}s`);
    this.totalTimeText.setVisible(true);

    this.timerText.setText('All levels completed!');
    this.timerText.setColor('#4ecdc4');

    // 添加重启提示
    this.add.text(400, 400, 'Click to restart', {
      fontSize: '20px',
      color: '#95e1d3'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    // 输出状态信号用于验证
    console.log('GAME_WON:', {
      currentLevel: this.currentLevel,
      totalTime: totalSeconds,
      gameWon: this.gameWon
    });
  }

  failGame() {
    this.gameOver = true;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 隐藏游戏元素
    this.targetGraphics.clear();
    this.hintText.setVisible(false);

    // 显示失败信息
    this.resultText.setText('TIME OUT!');
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);

    this.timerText.setText(`Failed at Level ${this.currentLevel}`);
    this.timerText.setColor('#ff6b6b');

    // 添加重启提示
    this.add.text(400, 400, 'Click to restart', {
      fontSize: '20px',
      color: '#95e1d3'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    // 输出状态信号用于验证
    console.log('GAME_OVER:', {
      currentLevel: this.currentLevel,
      failedAt: this.currentLevel,
      gameOver: this.gameOver
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  // 设置固定随机种子以保持确定性（可选）
  seed: [(Date.now() * Math.random()).toString()]
};

new Phaser.Game(config);