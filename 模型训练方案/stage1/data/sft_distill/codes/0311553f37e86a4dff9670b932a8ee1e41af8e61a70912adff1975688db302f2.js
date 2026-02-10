class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 1000; // 每关1秒
    this.totalElapsedTime = 0; // 总用时（毫秒）
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    this.isGameOver = false;
    this.isGameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化游戏
    this.isGameOver = false;
    this.isGameWon = false;
    this.currentLevel = 1;
    this.totalElapsedTime = 0;
    this.gameStartTime = this.time.now;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(400, 50, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 150, '点击绿色方块完成关卡！', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.totalTimeText = this.add.text(400, 550, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.isGameOver || this.isGameWon) return;

    this.levelStartTime = this.time.now;

    // 更新关卡显示
    this.levelText.setText(`关卡 ${this.currentLevel} / ${this.maxLevel}`);
    this.instructionText.setText('点击绿色方块完成关卡！');

    // 清除之前的目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }

    // 创建目标区域（绿色方块）
    const targetX = 300 + Math.random() * 200;
    const targetY = 250 + Math.random() * 150;
    const targetSize = 80;

    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillRect(targetX - targetSize / 2, targetY - targetSize / 2, targetSize, targetSize);
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeRect(targetX - targetSize / 2, targetY - targetSize / 2, targetSize, targetSize);

    // 设置交互区域
    const zone = this.add.zone(targetX, targetY, targetSize, targetSize);
    zone.setInteractive();
    zone.on('pointerdown', () => this.onTargetClicked());

    // 添加目标文本
    this.targetText = this.add.text(targetX, targetY, 'CLICK', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建关卡倒计时
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => this.onLevelTimeout(),
      callbackScope: this
    });

    // 更新倒计时显示
    if (this.timerUpdateEvent) {
      this.timerUpdateEvent.remove();
    }

    this.timerUpdateEvent = this.time.addEvent({
      delay: 50,
      callback: () => this.updateTimerDisplay(),
      callbackScope: this,
      loop: true
    });
  }

  updateTimerDisplay() {
    if (this.isGameOver || this.isGameWon) {
      if (this.timerUpdateEvent) {
        this.timerUpdateEvent.remove();
      }
      return;
    }

    const elapsed = this.time.now - this.levelStartTime;
    const remaining = Math.max(0, this.levelTimeLimit - elapsed);
    const remainingSeconds = (remaining / 1000).toFixed(2);

    this.timerText.setText(`剩余时间: ${remainingSeconds}s`);

    // 时间不足时变红
    if (remaining < 300) {
      this.timerText.setColor('#ff0000');
    } else {
      this.timerText.setColor('#ffff00');
    }

    // 更新总用时显示
    const totalTime = (this.time.now - this.gameStartTime) / 1000;
    this.totalTimeText.setText(`总用时: ${totalTime.toFixed(2)}s`);
  }

  onTargetClicked() {
    if (this.isGameOver || this.isGameWon) return;

    // 清除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }
    if (this.timerUpdateEvent) {
      this.timerUpdateEvent.remove();
    }

    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetText) {
      this.targetText.destroy();
    }

    // 检查是否通关
    if (this.currentLevel >= this.maxLevel) {
      this.onGameWon();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => this.startLevel());
    }
  }

  onLevelTimeout() {
    if (this.isGameOver || this.isGameWon) return;

    this.isGameOver = true;

    // 清除计时器
    if (this.timerUpdateEvent) {
      this.timerUpdateEvent.remove();
    }

    // 显示失败信息
    this.levelText.setText('游戏失败！');
    this.levelText.setColor('#ff0000');
    this.timerText.setText('超时了！');
    this.instructionText.setText(`你在第 ${this.currentLevel} 关失败了`);

    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetText) {
      this.targetText.destroy();
    }

    // 显示重新开始按钮
    this.showRestartButton();
  }

  onGameWon() {
    this.isGameWon = true;
    this.totalElapsedTime = this.time.now - this.gameStartTime;

    // 显示胜利信息
    this.levelText.setText('🎉 恭喜通关！🎉');
    this.levelText.setColor('#00ff00');
    this.timerText.setText('');

    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);
    this.instructionText.setText(`总用时: ${totalSeconds} 秒`);
    this.totalTimeText.setText(`平均每关: ${(totalSeconds / this.maxLevel).toFixed(2)} 秒`);

    // 显示重新开始按钮
    this.showRestartButton();
  }

  showRestartButton() {
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a4a4a, 1);
    buttonBg.fillRoundedRect(300, 400, 200, 60, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(300, 400, 200, 60, 10);

    const buttonText = this.add.text(400, 430, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttonZone = this.add.zone(400, 430, 200, 60);
    buttonZone.setInteractive();
    buttonZone.on('pointerdown', () => {
      this.scene.restart();
    });

    // 添加悬停效果
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x6a6a6a, 1);
      buttonBg.fillRoundedRect(300, 400, 200, 60, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(300, 400, 200, 60, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4a4a4a, 1);
      buttonBg.fillRoundedRect(300, 400, 200, 60, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(300, 400, 200, 60, 10);
    });
  }

  update(time, delta) {
    // 主要逻辑在事件回调中处理
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