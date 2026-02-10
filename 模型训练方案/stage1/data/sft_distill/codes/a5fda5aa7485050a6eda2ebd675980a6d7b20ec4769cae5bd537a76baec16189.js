class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 3;
    this.levelTimeLimit = 2000; // 2秒每关
    this.startTime = 0;
    this.totalTime = 0;
    this.gameState = 'playing'; // playing, failed, completed
    this.levelTimer = null;
    this.remainingTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.gameState = 'playing';
    this.currentLevel = 1;
    this.startTime = this.time.now;
    
    // 创建UI文本
    this.levelText = this.add.text(400, 50, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 150, '点击绿色目标通关！', {
      fontSize: '18px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.restartText = this.add.text(400, 400, '', {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive();

    // 创建目标区域
    this.targetGraphics = this.add.graphics();
    
    // 开始第一关
    this.startLevel();

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer);
    });

    // 监听重新开始
    this.restartText.on('pointerdown', () => {
      if (this.gameState !== 'playing') {
        this.scene.restart();
      }
    });
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.completeGame();
      return;
    }

    this.gameState = 'playing';
    this.remainingTime = this.levelTimeLimit;

    // 更新关卡文本
    this.levelText.setText(`第 ${this.currentLevel} 关 / ${this.maxLevel}`);
    this.instructionText.setVisible(true);
    this.resultText.setText('');
    this.restartText.setText('');

    // 绘制目标区域（随机位置）
    this.drawTarget();

    // 启动倒计时
    if (this.levelTimer) {
      this.levelTimer.destroy();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        this.failLevel();
      },
      callbackScope: this
    });
  }

  drawTarget() {
    this.targetGraphics.clear();

    // 根据关卡调整目标大小和位置
    const baseSize = 80;
    const targetSize = baseSize - (this.currentLevel - 1) * 15; // 关卡越高，目标越小
    
    // 随机位置（确保不超出边界）
    const seed = this.currentLevel * 1234; // 固定种子确保确定性
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    const margin = targetSize;
    const targetX = margin + pseudoRandom * (800 - 2 * margin);
    const targetY = 250 + ((this.currentLevel * 7919) % 200); // 确定性Y位置

    this.targetX = targetX;
    this.targetY = targetY;
    this.targetSize = targetSize;

    // 绘制绿色圆形目标
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillCircle(targetX, targetY, targetSize / 2);

    // 绘制边框
    this.targetGraphics.lineStyle(3, 0xffffff, 1);
    this.targetGraphics.strokeCircle(targetX, targetY, targetSize / 2);
  }

  handleClick(pointer) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 检查是否点击在目标区域内
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.targetX, this.targetY
    );

    if (distance <= this.targetSize / 2) {
      this.passLevel();
    }
  }

  passLevel() {
    if (this.gameState !== 'playing') {
      return;
    }

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
      this.levelTimer = null;
    }

    // 进入下一关
    this.currentLevel++;
    
    if (this.currentLevel <= this.maxLevel) {
      // 显示过关提示
      this.resultText.setText('✓ 通过！');
      this.resultText.setColor('#00ff00');
      
      // 0.5秒后进入下一关
      this.time.delayedCall(500, () => {
        this.startLevel();
      });
    } else {
      this.completeGame();
    }
  }

  failLevel() {
    if (this.gameState !== 'playing') {
      return;
    }

    this.gameState = 'failed';
    
    // 清除目标
    this.targetGraphics.clear();
    this.instructionText.setVisible(false);
    this.timerText.setText('');

    // 显示失败信息
    this.levelText.setText('游戏失败！');
    this.resultText.setText(`第 ${this.currentLevel} 关超时`);
    this.resultText.setColor('#ff0000');
    
    this.restartText.setText('点击重新开始');
  }

  completeGame() {
    this.gameState = 'completed';
    this.totalTime = this.time.now - this.startTime;

    // 清除目标
    this.targetGraphics.clear();
    this.instructionText.setVisible(false);
    this.timerText.setText('');

    // 显示完成信息
    this.levelText.setText('🎉 全部通关！');
    this.resultText.setText(`总用时: ${(this.totalTime / 1000).toFixed(2)} 秒`);
    this.resultText.setColor('#ffff00');
    
    this.restartText.setText('点击重新开始');
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新倒计时显示
      this.remainingTime = this.levelTimeLimit - this.levelTimer.getElapsed();
      
      if (this.remainingTime < 0) {
        this.remainingTime = 0;
      }

      const seconds = (this.remainingTime / 1000).toFixed(2);
      this.timerText.setText(`剩余时间: ${seconds} 秒`);

      // 时间紧张时变红
      if (this.remainingTime < 500) {
        this.timerText.setColor('#ff0000');
      } else if (this.remainingTime < 1000) {
        this.timerText.setColor('#ff8800');
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
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);