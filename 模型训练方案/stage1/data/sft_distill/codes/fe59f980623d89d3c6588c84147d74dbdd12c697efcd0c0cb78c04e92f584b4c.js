class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // 游戏状态变量（可验证）
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 4000; // 4秒
    this.totalElapsedTime = 0; // 总用时（毫秒）
    this.gameState = 'playing'; // playing, failed, completed
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.remainingTime = 0;
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
    
    this.timerText = this.add.text(width - 150, 20, '', {
      fontSize: '24px',
      color: '#ffcc00',
      fontFamily: 'Arial'
    });
    
    this.totalTimeText = this.add.text(20, 60, '', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    
    this.instructionText = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
    
    this.detailText = this.add.text(width / 2, height / 2 + 60, '', {
      fontSize: '20px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
    
    // 目标对象容器
    this.target = null;
    this.targetGraphics = null;
    
    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.completeGame();
      return;
    }
    
    this.gameState = 'playing';
    this.levelStartTime = this.time.now;
    this.remainingTime = this.levelTimeLimit;
    
    // 更新UI
    this.updateUI();
    this.instructionText.setText(`关卡 ${this.currentLevel}\n点击目标通关！`);
    this.resultText.setVisible(false);
    this.detailText.setVisible(false);
    
    // 创建目标
    this.createTarget();
    
    // 创建关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }
    
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });
  }

  createTarget() {
    const { width, height } = this.cameras.main;
    
    // 清除旧目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    
    // 使用固定随机种子生成位置（基于关卡数）
    const seed = this.currentLevel * 12345;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    const minX = 100;
    const maxX = width - 100;
    const minY = 200;
    const maxY = height - 100;
    
    const targetX = minX + pseudoRandom * (maxX - minX);
    const targetY = minY + ((seed % 1000) / 1000) * (maxY - minY);
    
    // 目标大小随关卡递减
    const targetSize = 80 - (this.currentLevel - 1) * 10;
    
    // 绘制目标
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.x = targetX;
    this.targetGraphics.y = targetY;
    
    // 外圈
    this.targetGraphics.lineStyle(4, 0xff0000, 1);
    this.targetGraphics.strokeCircle(0, 0, targetSize);
    
    // 中圈
    this.targetGraphics.lineStyle(3, 0xff6600, 1);
    this.targetGraphics.strokeCircle(0, 0, targetSize * 0.6);
    
    // 中心点
    this.targetGraphics.fillStyle(0xffcc00, 1);
    this.targetGraphics.fillCircle(0, 0, targetSize * 0.2);
    
    // 设置交互
    this.targetGraphics.setInteractive(
      new Phaser.Geom.Circle(0, 0, targetSize),
      Phaser.Geom.Circle.Contains
    );
    
    this.targetGraphics.on('pointerdown', this.onTargetClick, this);
    
    // 添加悬停效果
    this.targetGraphics.on('pointerover', () => {
      this.targetGraphics.clear();
      this.targetGraphics.lineStyle(4, 0x00ff00, 1);
      this.targetGraphics.strokeCircle(0, 0, targetSize);
      this.targetGraphics.lineStyle(3, 0x00ff88, 1);
      this.targetGraphics.strokeCircle(0, 0, targetSize * 0.6);
      this.targetGraphics.fillStyle(0x00ffff, 1);
      this.targetGraphics.fillCircle(0, 0, targetSize * 0.2);
    });
    
    this.targetGraphics.on('pointerout', () => {
      if (this.gameState === 'playing') {
        this.targetGraphics.clear();
        this.targetGraphics.lineStyle(4, 0xff0000, 1);
        this.targetGraphics.strokeCircle(0, 0, targetSize);
        this.targetGraphics.lineStyle(3, 0xff6600, 1);
        this.targetGraphics.strokeCircle(0, 0, targetSize * 0.6);
        this.targetGraphics.fillStyle(0xffcc00, 1);
        this.targetGraphics.fillCircle(0, 0, targetSize * 0.2);
      }
    });
  }

  onTargetClick() {
    if (this.gameState !== 'playing') return;
    
    // 记录本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;
    
    // 移除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }
    
    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
      this.targetGraphics = null;
    }
    
    // 进入下一关
    this.currentLevel++;
    
    // 延迟开始下一关
    this.time.delayedCall(500, () => {
      this.startLevel();
    });
  }

  onLevelTimeout() {
    this.gameState = 'failed';
    
    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
      this.targetGraphics = null;
    }
    
    // 显示失败信息
    this.instructionText.setText('');
    this.resultText.setText('游戏失败！').setColor('#ff0000').setVisible(true);
    this.detailText.setText(
      `未能在时限内完成关卡 ${this.currentLevel}\n` +
      `已完成: ${this.currentLevel - 1}/${this.maxLevel} 关\n\n` +
      `按 R 键重新开始`
    ).setVisible(true);
    
    this.updateUI();
    
    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.restartGame();
    });
  }

  completeGame() {
    this.gameState = 'completed';
    
    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);
    
    // 显示成功信息
    this.instructionText.setText('');
    this.resultText.setText('恭喜通关！').setColor('#00ff00').setVisible(true);
    this.detailText.setText(
      `完成全部 ${this.maxLevel} 关\n` +
      `总用时: ${totalSeconds} 秒\n\n` +
      `按 R 键重新开始`
    ).setVisible(true);
    
    this.updateUI();
    
    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.restartGame();
    });
  }

  restartGame() {
    this.currentLevel = 1;
    this.totalElapsedTime = 0;
    this.gameState = 'playing';
    this.startLevel();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    
    if (this.gameState === 'playing') {
      const timeLeft = Math.max(0, this.remainingTime / 1000).toFixed(1);
      this.timerText.setText(`时间: ${timeLeft}s`);
      
      const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);
      this.totalTimeText.setText(`总用时: ${totalSeconds}s`);
    } else {
      this.timerText.setText('时间: 0.0s');
    }
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新剩余时间
      this.remainingTime = Math.max(0, this.levelTimeLimit - (time - this.levelStartTime));
      this.updateUI();
      
      // 时间快用完时改变颜色
      if (this.remainingTime < 1000) {
        this.timerText.setColor('#ff0000');
      } else if (this.remainingTime < 2000) {
        this.timerText.setColor('#ff6600');
      } else {
        this.timerText.setColor('#ffcc00');
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

new Phaser.Game(config);