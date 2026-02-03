class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevels = 15;
    this.levelTimeLimit = 1000; // 1秒 = 1000毫秒
    this.totalElapsedTime = 0;
    this.levelStartTime = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.levelTimer = null;
    this.target = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(20, 20, `关卡: ${this.currentLevel}/${this.maxLevels}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    this.timerText = this.add.text(20, 50, '剩余时间: 1.00s', {
      fontSize: '24px',
      color: '#ffff00'
    });

    this.totalTimeText = this.add.text(20, 80, '总用时: 0.00s', {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 500, '点击绿色目标完成关卡！', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    // 清除之前的目标
    if (this.target) {
      this.target.destroy();
    }

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建目标（随机位置的圆形）
    const targetX = Phaser.Math.Between(150, 650);
    const targetY = Phaser.Math.Between(150, 450);
    const targetRadius = 30;

    this.target = this.add.graphics();
    this.target.fillStyle(0x00ff00, 1);
    this.target.fillCircle(targetX, targetY, targetRadius);
    this.target.setInteractive(
      new Phaser.Geom.Circle(targetX, targetY, targetRadius),
      Phaser.Geom.Circle.Contains
    );

    // 点击目标完成关卡
    this.target.on('pointerdown', () => {
      if (!this.gameOver && !this.gameWon) {
        this.completeLevel();
      }
    });

    // 设置关卡倒计时
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.failLevel,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.updateUI();
  }

  completeLevel() {
    if (this.gameOver || this.gameWon) return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;

    // 移除当前关卡的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 检查是否完成所有关卡
    if (this.currentLevel >= this.maxLevels) {
      this.winGame();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.startLevel();
    }
  }

  failLevel() {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;

    // 清除目标
    if (this.target) {
      this.target.destroy();
      this.target = null;
    }

    // 显示失败信息
    this.messageText.setText(`游戏失败！\n第 ${this.currentLevel} 关超时\n\n点击重新开始`);
    this.messageText.setColor('#ff0000');
    this.instructionText.setVisible(false);

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  winGame() {
    this.gameWon = true;

    // 清除目标
    if (this.target) {
      this.target.destroy();
      this.target = null;
    }

    // 计算总用时（秒）
    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);

    // 显示胜利信息
    this.messageText.setText(`恭喜通关！\n完成 ${this.maxLevels} 关\n总用时: ${totalSeconds}秒\n\n点击重新开始`);
    this.messageText.setColor('#00ff00');
    this.instructionText.setVisible(false);

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 更新UI显示
    this.updateUI();
  }

  updateUI() {
    // 更新关卡显示
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevels}`);

    // 更新倒计时显示
    if (this.levelTimer) {
      const remaining = this.levelTimer.getRemaining();
      const remainingSeconds = Math.max(0, remaining / 1000).toFixed(2);
      this.timerText.setText(`剩余时间: ${remainingSeconds}s`);

      // 时间不足0.3秒时变红色警告
      if (remaining < 300) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }

    // 更新总用时显示
    const currentTotalTime = this.totalElapsedTime + (this.time.now - this.levelStartTime);
    const totalSeconds = (currentTotalTime / 1000).toFixed(2);
    this.totalTimeText.setText(`总用时: ${totalSeconds}s`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);