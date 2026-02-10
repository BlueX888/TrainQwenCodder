class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 2000; // 2秒
    this.totalTimeElapsed = 0;
    this.levelStartTime = 0;
    this.gameState = 'playing'; // playing, won, failed
    this.levelTimer = null;
    this.remainingTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.titleText = this.add.text(400, 50, 'Level Challenge', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建关卡信息文本
    this.levelText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建倒计时文本
    this.timerText = this.add.text(400, 150, '', {
      fontSize: '28px',
      color: '#ff6b6b'
    }).setOrigin(0.5);

    // 创建总用时文本
    this.totalTimeText = this.add.text(400, 200, '', {
      fontSize: '20px',
      color: '#4ecdc4'
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(400, 500, 'Click the target within 2 seconds!', {
      fontSize: '18px',
      color: '#95e1d3'
    }).setOrigin(0.5);

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '36px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建重试按钮（初始隐藏）
    this.retryButton = this.createButton(400, 400, 'Retry', () => {
      this.scene.restart();
    }).setVisible(false);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.showVictory();
      return;
    }

    this.gameState = 'playing';
    this.levelStartTime = this.time.now;
    this.remainingTime = this.levelTimeLimit;

    // 更新UI
    this.updateUI();

    // 清除之前的目标
    if (this.target) {
      this.target.destroy();
    }

    // 创建新目标
    this.createTarget();

    // 创建关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        if (this.gameState === 'playing') {
          this.levelFailed();
        }
      },
      callbackScope: this
    });
  }

  createTarget() {
    // 随机位置（避免边缘）
    const x = Phaser.Math.Between(150, 650);
    const y = Phaser.Math.Between(250, 450);
    const radius = 40;

    // 创建目标容器
    this.target = this.add.container(x, y);

    // 创建圆形目标
    const circle = this.add.graphics();
    circle.fillStyle(0xff0000, 1);
    circle.fillCircle(0, 0, radius);
    circle.lineStyle(4, 0xffffff, 1);
    circle.strokeCircle(0, 0, radius);

    // 创建关卡数字
    const levelNum = this.add.text(0, 0, this.currentLevel.toString(), {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.target.add([circle, levelNum]);

    // 设置交互
    circle.setInteractive(
      new Phaser.Geom.Circle(0, 0, radius),
      Phaser.Geom.Circle.Contains
    );

    circle.on('pointerdown', () => {
      if (this.gameState === 'playing') {
        this.levelCompleted();
      }
    });

    // 添加脉动动画
    this.tweens.add({
      targets: this.target,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }

  levelCompleted() {
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTimeElapsed += levelTime;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 目标消失动画
    this.tweens.add({
      targets: this.target,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        this.currentLevel++;
        this.time.delayedCall(300, () => {
          this.startLevel();
        });
      }
    });
  }

  levelFailed() {
    this.gameState = 'failed';

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 显示失败信息
    this.resultText.setText(`FAILED!\nLevel ${this.currentLevel} - Time Out!`)
      .setColor('#ff0000')
      .setVisible(true);

    this.hintText.setVisible(false);
    this.retryButton.setVisible(true);

    // 目标变灰
    if (this.target) {
      this.tweens.add({
        targets: this.target,
        alpha: 0.3,
        duration: 300
      });
    }
  }

  showVictory() {
    this.gameState = 'won';

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    const totalSeconds = (this.totalTimeElapsed / 1000).toFixed(2);

    // 显示胜利信息
    this.resultText.setText(`VICTORY!\nAll 5 Levels Completed!\nTotal Time: ${totalSeconds}s`)
      .setColor('#00ff00')
      .setVisible(true);

    this.hintText.setVisible(false);
    this.retryButton.setText('Play Again').setVisible(true);

    // 庆祝动画
    this.tweens.add({
      targets: this.resultText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  createButton(x, y, text, callback) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x4ecdc4, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-80, -25, 160, 50, 10);

    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, label]);

    bg.setInteractive(
      new Phaser.Geom.Rectangle(-80, -25, 160, 50),
      Phaser.Geom.Rectangle.Contains
    );

    bg.on('pointerdown', callback);

    bg.on('pointerover', () => {
      button.setScale(1.1);
    });

    bg.on('pointerout', () => {
      button.setScale(1);
    });

    return button;
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel} / ${this.maxLevel}`);
    
    const totalSeconds = (this.totalTimeElapsed / 1000).toFixed(2);
    this.totalTimeText.setText(`Total Time: ${totalSeconds}s`);
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新倒计时显示
      this.remainingTime = Math.max(0, this.levelTimeLimit - (time - this.levelStartTime));
      const remainingSeconds = (this.remainingTime / 1000).toFixed(2);
      this.timerText.setText(`Time Left: ${remainingSeconds}s`);

      // 时间紧急时变红
      if (this.remainingTime < 500) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ff6b6b');
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene
};

new Phaser.Game(config);