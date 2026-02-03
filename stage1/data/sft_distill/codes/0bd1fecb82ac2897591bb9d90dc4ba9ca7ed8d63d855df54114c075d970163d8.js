class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 3;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.gameState = 'playing'; // playing, win, lose
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 记录关卡开始时间
    this.levelStartTime = this.time.now;
    
    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建关卡显示文本
    this.levelText = this.add.text(400, 100, `关卡 ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(400, 200, '剩余时间: 0.500s', {
      fontSize: '32px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建总用时显示
    this.totalTimeText = this.add.text(400, 260, `总用时: ${(this.totalTime / 1000).toFixed(3)}s`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(400, 320, '点击下方按钮通过本关！', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建通关按钮
    this.createPassButton();

    // 创建关卡倒计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 450, '', {
      fontSize: '36px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 创建重试按钮（初始隐藏）
    this.createRetryButton();
  }

  createPassButton() {
    // 绘制按钮背景
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x00aa00, 1);
    buttonGraphics.fillRoundedRect(300, 380, 200, 60, 10);
    buttonGraphics.lineStyle(3, 0x00ff00, 1);
    buttonGraphics.strokeRoundedRect(300, 380, 200, 60, 10);

    // 按钮文字
    const buttonText = this.add.text(400, 410, '通过本关', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(400, 410, 200, 60).setInteractive();
    
    buttonZone.on('pointerdown', () => {
      if (this.gameState === 'playing') {
        this.onPassLevel();
      }
    });

    buttonZone.on('pointerover', () => {
      if (this.gameState === 'playing') {
        buttonGraphics.clear();
        buttonGraphics.fillStyle(0x00cc00, 1);
        buttonGraphics.fillRoundedRect(300, 380, 200, 60, 10);
        buttonGraphics.lineStyle(3, 0x00ff00, 1);
        buttonGraphics.strokeRoundedRect(300, 380, 200, 60, 10);
      }
    });

    buttonZone.on('pointerout', () => {
      if (this.gameState === 'playing') {
        buttonGraphics.clear();
        buttonGraphics.fillStyle(0x00aa00, 1);
        buttonGraphics.fillRoundedRect(300, 380, 200, 60, 10);
        buttonGraphics.lineStyle(3, 0x00ff00, 1);
        buttonGraphics.strokeRoundedRect(300, 380, 200, 60, 10);
      }
    });

    this.passButtonGraphics = buttonGraphics;
    this.passButtonText = buttonText;
    this.passButtonZone = buttonZone;
  }

  createRetryButton() {
    // 绘制重试按钮背景
    const retryGraphics = this.add.graphics();
    retryGraphics.fillStyle(0x0066cc, 1);
    retryGraphics.fillRoundedRect(300, 500, 200, 60, 10);
    retryGraphics.lineStyle(3, 0x0099ff, 1);
    retryGraphics.strokeRoundedRect(300, 500, 200, 60, 10);

    // 按钮文字
    const retryText = this.add.text(400, 530, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建交互区域
    const retryZone = this.add.zone(400, 530, 200, 60).setInteractive();
    
    retryZone.on('pointerdown', () => {
      this.scene.restart();
    });

    retryZone.on('pointerover', () => {
      retryGraphics.clear();
      retryGraphics.fillStyle(0x0088ee, 1);
      retryGraphics.fillRoundedRect(300, 500, 200, 60, 10);
      retryGraphics.lineStyle(3, 0x0099ff, 1);
      retryGraphics.strokeRoundedRect(300, 500, 200, 60, 10);
    });

    retryZone.on('pointerout', () => {
      retryGraphics.clear();
      retryGraphics.fillStyle(0x0066cc, 1);
      retryGraphics.fillRoundedRect(300, 500, 200, 60, 10);
      retryGraphics.lineStyle(3, 0x0099ff, 1);
      retryGraphics.strokeRoundedRect(300, 500, 200, 60, 10);
    });

    this.retryGraphics = retryGraphics;
    this.retryText = retryText;
    this.retryZone = retryZone;

    // 初始隐藏
    retryGraphics.setVisible(false);
    retryText.setVisible(false);
    retryZone.setActive(false);
  }

  onPassLevel() {
    if (this.gameState !== 'playing') return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 停止当前关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 检查是否完成所有关卡
    if (this.currentLevel >= this.maxLevel) {
      this.onGameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.levelStartTime = this.time.now;
      
      // 更新UI
      this.levelText.setText(`关卡 ${this.currentLevel}/${this.maxLevel}`);
      this.totalTimeText.setText(`总用时: ${(this.totalTime / 1000).toFixed(3)}s`);
      
      // 重新创建关卡计时器
      this.levelTimer = this.time.addEvent({
        delay: this.levelTimeLimit,
        callback: this.onLevelTimeout,
        callbackScope: this,
        loop: false
      });
    }
  }

  onLevelTimeout() {
    if (this.gameState !== 'playing') return;
    
    this.gameState = 'lose';
    
    // 隐藏通关按钮
    this.passButtonGraphics.setVisible(false);
    this.passButtonText.setVisible(false);
    this.passButtonZone.setActive(false);
    this.hintText.setVisible(false);

    // 显示失败信息
    this.resultText.setText(`超时失败！\n第${this.currentLevel}关未在0.5秒内完成`);
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);

    // 显示重试按钮
    this.retryGraphics.setVisible(true);
    this.retryText.setVisible(true);
    this.retryZone.setActive(true);
  }

  onGameWin() {
    this.gameState = 'win';
    
    // 隐藏通关按钮
    this.passButtonGraphics.setVisible(false);
    this.passButtonText.setVisible(false);
    this.passButtonZone.setActive(false);
    this.hintText.setVisible(false);

    // 显示胜利信息
    this.resultText.setText(`恭喜通关！\n总用时: ${(this.totalTime / 1000).toFixed(3)}秒`);
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);

    // 显示重试按钮
    this.retryGraphics.setVisible(true);
    this.retryText.setVisible(true);
    this.retryZone.setActive(true);
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新倒计时显示
      const remaining = this.levelTimer.getRemaining();
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(3)}s`);
      
      // 根据剩余时间改变颜色
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
      } else if (remaining < 300) {
        this.timerText.setColor('#ff9900');
      } else {
        this.timerText.setColor('#ffff00');
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