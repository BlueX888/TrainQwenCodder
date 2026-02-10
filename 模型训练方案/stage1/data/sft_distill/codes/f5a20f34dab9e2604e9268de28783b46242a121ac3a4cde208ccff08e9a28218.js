// 游戏状态信号
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 12,
  timeRemaining: 2000,
  totalTimeElapsed: 0,
  gameStatus: 'playing', // playing, failed, completed
  clickCount: 0,
  logs: []
};

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 12;
    this.levelTimeLimit = 2000; // 每关2秒
    this.totalTimeElapsed = 0;
    this.levelStartTime = 0;
    this.gameStartTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    this.gameStartTime = this.time.now;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.timerText = this.add.text(400, 20, '', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    this.totalTimeText = this.add.text(780, 20, '', {
      fontSize: '20px',
      color: '#ffaa00'
    }).setOrigin(1, 0);

    this.instructionText = this.add.text(400, 300, '点击绿色目标通关！', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();

    // 记录日志
    this.logEvent('game_start', { totalLevels: this.totalLevels });
  }

  startLevel() {
    this.levelStartTime = this.time.now;
    
    // 清除之前的目标和计时器
    if (this.target) {
      this.target.destroy();
    }
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    this.instructionText.setVisible(this.currentLevel === 1);

    // 生成目标位置（使用确定性随机）
    const seed = this.currentLevel * 1000;
    const targetX = 150 + ((seed * 9301 + 49297) % 233280) / 233280 * 500;
    const targetY = 150 + ((seed * 1103 + 12345) % 233280) / 233280 * 300;

    // 创建目标
    this.createTarget(targetX, targetY);

    // 创建倒计时器
    this.timeRemaining = this.levelTimeLimit;
    this.levelTimer = this.time.addEvent({
      delay: 50,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 记录日志
    this.logEvent('level_start', {
      level: this.currentLevel,
      targetX: Math.round(targetX),
      targetY: Math.round(targetY)
    });

    // 更新信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.timeRemaining = this.timeRemaining;
    window.__signals__.gameStatus = 'playing';
  }

  createTarget(x, y) {
    // 创建目标容器
    this.target = this.add.container(x, y);

    // 外圈（脉动效果）
    const outerCircle = this.add.graphics();
    outerCircle.lineStyle(4, 0x00ff00, 0.6);
    outerCircle.strokeCircle(0, 0, 40);
    this.target.add(outerCircle);

    // 中圈
    const middleCircle = this.add.graphics();
    middleCircle.lineStyle(3, 0x00ff00, 0.8);
    middleCircle.strokeCircle(0, 0, 25);
    this.target.add(middleCircle);

    // 内圈（实心）
    const innerCircle = this.add.graphics();
    innerCircle.fillStyle(0x00ff00, 1);
    innerCircle.fillCircle(0, 0, 15);
    this.target.add(innerCircle);

    // 添加脉动动画
    this.tweens.add({
      targets: outerCircle,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 设置交互区域
    const hitArea = new Phaser.Geom.Circle(0, 0, 40);
    this.target.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    this.target.on('pointerdown', this.onTargetClick, this);

    // 鼠标悬停效果
    this.target.on('pointerover', () => {
      innerCircle.clear();
      innerCircle.fillStyle(0x00ffaa, 1);
      innerCircle.fillCircle(0, 0, 15);
    });

    this.target.on('pointerout', () => {
      innerCircle.clear();
      innerCircle.fillStyle(0x00ff00, 1);
      innerCircle.fillCircle(0, 0, 15);
    });
  }

  updateTimer() {
    const elapsed = this.time.now - this.levelStartTime;
    this.timeRemaining = Math.max(0, this.levelTimeLimit - elapsed);

    // 更新显示
    const seconds = (this.timeRemaining / 1000).toFixed(2);
    this.timerText.setText(`${seconds}s`);

    // 根据剩余时间改变颜色
    if (this.timeRemaining < 500) {
      this.timerText.setColor('#ff0000');
    } else if (this.timeRemaining < 1000) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#00ff00');
    }

    // 更新总用时
    this.totalTimeElapsed = this.time.now - this.gameStartTime;
    this.totalTimeText.setText(`总用时: ${(this.totalTimeElapsed / 1000).toFixed(2)}s`);

    // 超时检查
    if (this.timeRemaining <= 0) {
      this.gameFailed();
    }

    // 更新信号
    window.__signals__.timeRemaining = this.timeRemaining;
    window.__signals__.totalTimeElapsed = this.totalTimeElapsed;
  }

  onTargetClick() {
    window.__signals__.clickCount++;

    const levelTime = this.time.now - this.levelStartTime;
    
    // 记录日志
    this.logEvent('level_complete', {
      level: this.currentLevel,
      timeUsed: levelTime
    });

    // 创建完成特效
    this.createCompleteEffect(this.target.x, this.target.y);

    // 下一关或通关
    if (this.currentLevel < this.totalLevels) {
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    } else {
      this.gameCompleted();
    }
  }

  createCompleteEffect(x, y) {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.add.graphics();
      particle.fillStyle(0x00ff00, 1);
      particle.fillCircle(x, y, 5);
      particles.push(particle);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 100,
        y: y + Math.sin(angle) * 100,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }

  gameFailed() {
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    window.__signals__.gameStatus = 'failed';
    
    this.logEvent('game_failed', {
      level: this.currentLevel,
      totalTime: this.totalTimeElapsed
    });

    this.showResultScreen(false);
  }

  gameCompleted() {
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    window.__signals__.gameStatus = 'completed';
    
    this.logEvent('game_completed', {
      totalTime: this.totalTimeElapsed,
      clicks: window.__signals__.clickCount
    });

    this.showResultScreen(true);
  }

  showResultScreen(success) {
    // 清除游戏元素
    if (this.target) {
      this.target.destroy();
    }

    // 创建结果背景
    const resultBg = this.add.graphics();
    resultBg.fillStyle(0x000000, 0.8);
    resultBg.fillRect(0, 0, 800, 600);

    // 结果标题
    const titleText = success ? '🎉 恭喜通关！' : '⏰ 时间到！';
    const titleColor = success ? '#00ff00' : '#ff0000';
    
    this.add.text(400, 150, titleText, {
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示统计信息
    const stats = [
      `完成关卡: ${success ? this.totalLevels : this.currentLevel - 1}/${this.totalLevels}`,
      `总用时: ${(this.totalTimeElapsed / 1000).toFixed(2)} 秒`,
      `点击次数: ${window.__signals__.clickCount}`,
      success ? `平均每关: ${(this.totalTimeElapsed / this.totalLevels / 1000).toFixed(2)} 秒` : ''
    ];

    let yPos = 250;
    stats.forEach(stat => {
      if (stat) {
        this.add.text(400, yPos, stat, {
          fontSize: '24px',
          color: '#ffffff'
        }).setOrigin(0.5);
        yPos += 40;
      }
    });

    // 重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x4444ff, 1);
    restartButton.fillRoundedRect(300, 450, 200, 60, 10);
    
    const restartText = this.add.text(400, 480, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttonArea = new Phaser.Geom.Rectangle(300, 450, 200, 60);
    restartButton.setInteractive(buttonArea, Phaser.Geom.Rectangle.Contains);
    
    restartButton.on('pointerdown', () => {
      this.scene.restart();
      // 重置信号
      window.__signals__ = {
        currentLevel: 1,
        totalLevels: 12,
        timeRemaining: 2000,
        totalTimeElapsed: 0,
        gameStatus: 'playing',
        clickCount: 0,
        logs: []
      };
    });

    restartButton.on('pointerover', () => {
      restartButton.clear();
      restartButton.fillStyle(0x6666ff, 1);
      restartButton.fillRoundedRect(300, 450, 200, 60, 10);
    });

    restartButton.on('pointerout', () => {
      restartButton.clear();
      restartButton.fillStyle(0x4444ff, 1);
      restartButton.fillRoundedRect(300, 450, 200, 60, 10);
    });
  }

  logEvent(event, data) {
    const log = {
      timestamp: this.time.now,
      event: event,
      ...data
    };
    window.__signals__.logs.push(log);
    console.log('[Game Log]', JSON.stringify(log));
  }

  update(time, delta) {
    // 主循环逻辑已在 TimerEvent 中处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('[Game Signals]', JSON.stringify(window.__signals__, null, 2));