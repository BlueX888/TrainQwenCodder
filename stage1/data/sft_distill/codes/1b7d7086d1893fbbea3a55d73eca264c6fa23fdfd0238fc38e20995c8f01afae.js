class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 3;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.gameState = 'playing'; // playing, win, lose
    this.levelTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(400, 50, `关卡: ${this.currentLevel}/${this.totalLevels}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '剩余时间: 0.500s', {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.totalTimeText = this.add.text(400, 150, '总用时: 0.000s', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 250, '点击绿色方块通关！', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.statusText = this.add.text(400, 500, '', {
      fontSize: '36px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建目标区域（使用Graphics）
    this.targetGraphics = this.add.graphics();
    this.targetX = 350;
    this.targetY = 320;
    this.targetWidth = 100;
    this.targetHeight = 100;

    this.drawTarget();

    // 设置点击区域
    const zone = this.add.zone(this.targetX, this.targetY, this.targetWidth, this.targetHeight);
    zone.setInteractive();
    zone.on('pointerdown', () => this.onTargetClick());

    // 添加全局点击监听（用于重试）
    this.input.on('pointerdown', (pointer) => {
      if (this.gameState !== 'playing') {
        this.restartGame();
      }
    });

    // 开始第一关
    this.startLevel();
  }

  drawTarget() {
    this.targetGraphics.clear();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillRect(
      this.targetX - this.targetWidth / 2,
      this.targetY - this.targetHeight / 2,
      this.targetWidth,
      this.targetHeight
    );
    this.targetGraphics.lineStyle(3, 0xffffff, 1);
    this.targetGraphics.strokeRect(
      this.targetX - this.targetWidth / 2,
      this.targetY - this.targetHeight / 2,
      this.targetWidth,
      this.targetHeight
    );
  }

  startLevel() {
    this.gameState = 'playing';
    this.levelStartTime = this.time.now;
    
    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    this.instructionText.setText('点击绿色方块通关！');
    this.statusText.setText('');

    // 随机目标位置（保持在屏幕内）
    this.targetX = Phaser.Math.Between(150, 650);
    this.targetY = Phaser.Math.Between(320, 450);
    this.drawTarget();

    // 更新zone位置
    const zones = this.input.manager.list;
    if (zones.length > 0) {
      zones[0].x = this.targetX;
      zones[0].y = this.targetY;
    }

    // 创建倒计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => this.onTimeOut(),
      callbackScope: this
    });
  }

  onTargetClick() {
    if (this.gameState !== 'playing') return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 更新总用时显示
    this.totalTimeText.setText(`总用时: ${(this.totalTime / 1000).toFixed(3)}s`);

    // 移除当前倒计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 检查是否通关所有关卡
    if (this.currentLevel >= this.totalLevels) {
      this.onGameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    }
  }

  onTimeOut() {
    if (this.gameState !== 'playing') return;

    this.gameState = 'lose';
    this.statusText.setText('超时失败！');
    this.statusText.setColor('#ff0000');
    this.instructionText.setText('点击屏幕重新开始');
    
    // 隐藏目标
    this.targetGraphics.clear();
  }

  onGameWin() {
    this.gameState = 'win';
    this.statusText.setText(`通关成功！\n总用时: ${(this.totalTime / 1000).toFixed(3)}s`);
    this.statusText.setColor('#00ff00');
    this.instructionText.setText('点击屏幕重新开始');
    
    // 隐藏目标
    this.targetGraphics.clear();
  }

  restartGame() {
    // 重置所有状态
    this.currentLevel = 1;
    this.totalTime = 0;
    this.gameState = 'playing';
    
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    this.totalTimeText.setText('总用时: 0.000s');
    this.startLevel();
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新倒计时显示
      const remaining = this.levelTimer.getRemaining();
      const remainingSeconds = Math.max(0, remaining / 1000);
      this.timerText.setText(`剩余时间: ${remainingSeconds.toFixed(3)}s`);
      
      // 根据剩余时间改变颜色
      if (remainingSeconds < 0.2) {
        this.timerText.setColor('#ff0000');
      } else if (remainingSeconds < 0.35) {
        this.timerText.setColor('#ffaa00');
      } else {
        this.timerText.setColor('#00ff00');
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
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露可验证的状态信号
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    totalLevels: scene.totalLevels,
    totalTime: scene.totalTime,
    gameState: scene.gameState,
    levelTimeLimit: scene.levelTimeLimit
  };
};