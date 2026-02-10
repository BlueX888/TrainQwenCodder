class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevels = 8;
    this.levelTimeLimit = 2.5; // 每关限时2.5秒
    this.totalElapsedTime = 0; // 总用时
    this.levelStartTime = 0;
    this.isLevelActive = false;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建UI文本
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(20, 50, '', {
      fontSize: '20px',
      color: '#ffcc00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(20, 80, '', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(width / 2, height / 2 - 50, '', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 创建目标区域（玩家需要点击的区域）
    this.targetGraphics = this.add.graphics();
    
    // 创建结果文本（游戏结束时显示）
    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);

    this.restartText = this.add.text(width / 2, height / 2 + 60, '', {
      fontSize: '20px',
      color: '#ffcc00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);

    // 键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 鼠标输入
    this.input.on('pointerdown', this.handleClick, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevels) {
      this.winGame();
      return;
    }

    this.isLevelActive = true;
    this.levelStartTime = this.time.now;

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit * 1000,
      callback: this.levelTimeout,
      callbackScope: this,
      loop: false
    });

    // 生成目标位置（使用确定性随机）
    const seed = this.currentLevel * 123;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    const { width, height } = this.cameras.main;
    const margin = 100;
    this.targetX = margin + pseudoRandom * (width - margin * 2);
    this.targetY = margin + (((seed * 7919) % 233280) / 233280) * (height - margin * 2);
    this.targetRadius = 40 - this.currentLevel * 3; // 随关卡增加，目标变小

    // 绘制目标
    this.drawTarget();

    // 更新说明文本
    this.instructionText.setText(`点击圆形目标或按空格键通关！`);
  }

  drawTarget() {
    this.targetGraphics.clear();
    
    // 绘制目标圆形
    this.targetGraphics.fillStyle(0x00ff00, 0.8);
    this.targetGraphics.fillCircle(this.targetX, this.targetY, this.targetRadius);
    
    // 绘制边框
    this.targetGraphics.lineStyle(3, 0xffffff, 1);
    this.targetGraphics.strokeCircle(this.targetX, this.targetY, this.targetRadius);
  }

  handleClick(pointer) {
    if (!this.isLevelActive || this.gameOver || this.gameWon) {
      return;
    }

    // 检查是否点击在目标区域内
    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.targetX, this.targetY
    );

    if (distance <= this.targetRadius) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (!this.isLevelActive) return;

    this.isLevelActive = false;

    // 计算本关用时
    const levelTime = (this.time.now - this.levelStartTime) / 1000;
    this.totalElapsedTime += levelTime;

    // 移除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 清除目标
    this.targetGraphics.clear();

    // 短暂延迟后进入下一关
    this.time.delayedCall(500, () => {
      this.currentLevel++;
      this.startLevel();
    });
  }

  levelTimeout() {
    this.isLevelActive = false;
    this.gameOver = true;

    // 清除目标
    this.targetGraphics.clear();

    // 显示失败信息
    this.resultText.setText(`游戏失败！\n第 ${this.currentLevel} 关超时\n总用时: ${this.totalElapsedTime.toFixed(2)}秒`);
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);

    this.restartText.setText('按 R 键重新开始');
    this.restartText.setVisible(true);

    this.instructionText.setVisible(false);
  }

  winGame() {
    this.isLevelActive = false;
    this.gameWon = true;

    // 清除目标
    this.targetGraphics.clear();

    // 显示胜利信息
    this.resultText.setText(`恭喜通关！\n完成 ${this.maxLevels} 关\n总用时: ${this.totalElapsedTime.toFixed(2)}秒`);
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);

    this.restartText.setText('按 R 键重新开始');
    this.restartText.setVisible(true);

    this.instructionText.setVisible(false);
  }

  restartGame() {
    this.currentLevel = 1;
    this.totalElapsedTime = 0;
    this.gameOver = false;
    this.gameWon = false;

    this.resultText.setVisible(false);
    this.restartText.setVisible(false);
    this.instructionText.setVisible(true);

    this.startLevel();
  }

  update(time, delta) {
    // 更新UI文本
    this.levelText.setText(`关卡: ${this.currentLevel} / ${this.maxLevels}`);

    if (this.isLevelActive && this.levelTimer) {
      const remaining = this.levelTimeLimit - this.levelTimer.getElapsed() / 1000;
      this.timerText.setText(`剩余时间: ${Math.max(0, remaining).toFixed(2)}秒`);
      
      // 时间紧张时改变颜色
      if (remaining < 1) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffcc00');
      }
    }

    this.totalTimeText.setText(`总用时: ${this.totalElapsedTime.toFixed(2)}秒`);

    // 空格键也可以通关（备选方案）
    if (this.isLevelActive && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.completeLevel();
    }

    // R键重新开始
    if ((this.gameOver || this.gameWon) && Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.restartGame();
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