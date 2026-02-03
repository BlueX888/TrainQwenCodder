class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.levelTimeLimit = 1000; // 1秒
    this.isLevelActive = false;
    this.levelTimer = null;
    this.gameState = 'playing'; // playing, failed, completed
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成目标纹理
    this.createTargetTexture();

    // 初始化UI
    this.createUI();

    // 开始第一关
    this.startLevel();
  }

  createTargetTexture() {
    // 创建圆形目标纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6b6b, 1);
    graphics.fillCircle(32, 32, 30);
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeCircle(32, 32, 30);
    graphics.generateTexture('target', 64, 64);
    graphics.destroy();

    // 创建成功效果纹理
    const successGraphics = this.add.graphics();
    successGraphics.fillStyle(0x51cf66, 1);
    successGraphics.fillCircle(32, 32, 30);
    successGraphics.generateTexture('success', 64, 64);
    successGraphics.destroy();
  }

  createUI() {
    // 关卡显示
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 倒计时显示
    this.timerText = this.add.text(400, 20, '', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // 总用时显示
    this.totalTimeText = this.add.text(780, 20, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd93d',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // 提示文字
    this.hintText = this.add.text(400, 500, '点击目标通关！', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#a8dadc',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.showVictory();
      return;
    }

    this.isLevelActive = true;
    this.levelStartTime = this.time.now;
    this.gameState = 'playing';

    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.hintText.setText('快速点击目标！');

    // 创建目标
    this.createTarget();

    // 启动倒计时
    this.startTimer();
  }

  createTarget() {
    // 随机位置生成目标（避免边缘）
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(150, 450);

    if (this.target) {
      this.target.destroy();
    }

    this.target = this.add.sprite(x, y, 'target');
    this.target.setInteractive({ useHandCursor: true });
    this.target.setScale(1);

    // 添加脉动动画
    this.tweens.add({
      targets: this.target,
      scale: 1.1,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    // 点击事件
    this.target.once('pointerdown', () => {
      if (this.isLevelActive) {
        this.onTargetHit();
      }
    });
  }

  startTimer() {
    this.remainingTime = this.levelTimeLimit;

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建倒计时事件
    this.levelTimer = this.time.addEvent({
      delay: 50, // 每50ms更新一次
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  updateTimer() {
    if (!this.isLevelActive) return;

    const elapsed = this.time.now - this.levelStartTime;
    this.remainingTime = Math.max(0, this.levelTimeLimit - elapsed);

    // 更新显示
    const seconds = (this.remainingTime / 1000).toFixed(2);
    this.timerText.setText(seconds + 's');

    // 颜色变化警示
    if (this.remainingTime < 300) {
      this.timerText.setColor('#ff0000');
    } else if (this.remainingTime < 600) {
      this.timerText.setColor('#ff6b6b');
    } else {
      this.timerText.setColor('#51cf66');
    }

    // 超时检测
    if (this.remainingTime <= 0) {
      this.onTimeout();
    }
  }

  onTargetHit() {
    this.isLevelActive = false;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 更新总用时显示
    this.totalTimeText.setText(`总用时: ${(this.totalTime / 1000).toFixed(2)}s`);

    // 成功反馈
    this.target.setTexture('success');
    this.tweens.killTweensOf(this.target);
    
    this.tweens.add({
      targets: this.target,
      scale: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.target.destroy();
        this.nextLevel();
      }
    });

    // 播放成功音效（视觉反馈）
    this.cameras.main.flash(200, 81, 207, 102);
  }

  onTimeout() {
    this.isLevelActive = false;
    this.gameState = 'failed';

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.showFailure();
  }

  nextLevel() {
    this.currentLevel++;
    
    // 短暂延迟后开始下一关
    this.time.delayedCall(500, () => {
      this.startLevel();
    });
  }

  showFailure() {
    // 暗化背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);

    // 失败文字
    const failText = this.add.text(400, 250, '超时失败！', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const levelInfo = this.add.text(400, 330, `失败于第 ${this.currentLevel} 关`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 重试按钮
    const retryButton = this.createButton(400, 420, '重新开始', () => {
      this.scene.restart();
    });

    this.hintText.setVisible(false);
  }

  showVictory() {
    this.gameState = 'completed';

    // 暗化背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);

    // 胜利文字
    const victoryText = this.add.text(400, 200, '恭喜通关！', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#51cf66',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 总用时
    const totalSeconds = (this.totalTime / 1000).toFixed(2);
    const timeText = this.add.text(400, 290, `总用时: ${totalSeconds} 秒`, {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#ffd93d',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 评价
    let rating = '完美！';
    if (this.totalTime > 6000) {
      rating = '不错！';
    }
    if (this.totalTime > 7000) {
      rating = '还需努力！';
    }

    const ratingText = this.add.text(400, 360, rating, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#a8dadc'
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartButton = this.createButton(400, 460, '再玩一次', () => {
      this.scene.restart();
    });

    this.hintText.setVisible(false);
  }

  createButton(x, y, text, callback) {
    const button = this.add.graphics();
    button.fillStyle(0x4a90e2, 1);
    button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
    button.lineStyle(3, 0xffffff, 1);
    button.strokeRoundedRect(x - 120, y - 30, 240, 60, 10);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttonContainer = this.add.container(0, 0, [button, buttonText]);
    buttonContainer.setSize(240, 60);
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(x - 120, y - 30, 240, 60),
      Phaser.Geom.Rectangle.Contains
    );
    buttonContainer.on('pointerdown', callback);
    buttonContainer.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x5aa5ff, 1);
      button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x - 120, y - 30, 240, 60, 10);
    });
    buttonContainer.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4a90e2, 1);
      button.fillRoundedRect(x - 120, y - 30, 240, 60, 10);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(x - 120, y - 30, 240, 60, 10);
    });

    return buttonContainer;
  }

  update() {
    // 主更新循环（倒计时在 updateTimer 中处理）
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

new Phaser.Game(config);