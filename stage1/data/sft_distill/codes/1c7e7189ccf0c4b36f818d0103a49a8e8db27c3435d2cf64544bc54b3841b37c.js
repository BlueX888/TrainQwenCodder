// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 10,
  timePerLevel: 0.5,
  totalElapsedTime: 0,
  gameStatus: 'playing', // playing, failed, completed
  levelTimes: [],
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 10;
    this.timePerLevel = 500; // 0.5秒 = 500ms
    this.totalStartTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.totalStartTime = this.time.now;
    this.gameOver = false;

    // 创建UI容器
    this.createUI();
    
    // 开始第一关
    this.startLevel();

    // 记录游戏开始事件
    this.logEvent('game_start', { timestamp: this.totalStartTime });
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // 关卡标题
    this.levelText = this.add.text(width / 2, 50, '', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 倒计时显示
    this.timerText = this.add.text(width / 2, 100, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 总用时显示
    this.totalTimeText = this.add.text(width / 2, 150, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 提示文字
    this.hintText = this.add.text(width / 2, height - 100, '点击目标通过关卡！', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 结果文字（初始隐藏）
    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 目标图形容器
    this.targetGraphics = this.add.graphics();
  }

  startLevel() {
    if (this.gameOver) return;

    const { width, height } = this.cameras.main;

    // 更新关卡信息
    this.levelText.setText(`关卡 ${this.currentLevel}/${this.totalLevels}`);
    this.levelStartTime = this.time.now;

    // 清除之前的目标
    this.targetGraphics.clear();

    // 随机生成目标位置（使用关卡作为种子保证可重现）
    const seed = this.currentLevel * 12345;
    const x = 200 + ((seed * 9301 + 49297) % 233280) / 233280 * 400;
    const y = 250 + ((seed * 9301 + 49297) % 233280) / 233280 * 200;

    // 绘制目标（圆形）
    const targetRadius = 40 - (this.currentLevel - 1) * 3; // 关卡越高，目标越小
    this.targetGraphics.fillStyle(0xff0000, 1);
    this.targetGraphics.fillCircle(x, y, targetRadius);
    this.targetGraphics.lineStyle(3, 0xffffff, 1);
    this.targetGraphics.strokeCircle(x, y, targetRadius);

    // 设置点击区域
    const zone = this.add.zone(x, y, targetRadius * 2, targetRadius * 2)
      .setInteractive({ useHandCursor: true });
    
    zone.on('pointerdown', () => {
      if (!this.gameOver) {
        this.completeLevel();
      }
    });

    // 创建倒计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.timePerLevel,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    // 记录关卡开始事件
    this.logEvent('level_start', {
      level: this.currentLevel,
      timestamp: this.levelStartTime,
      targetPos: { x, y },
      targetRadius
    });

    // 更新signals
    window.__signals__.currentLevel = this.currentLevel;
  }

  completeLevel() {
    if (this.gameOver) return;

    const levelTime = this.time.now - this.levelStartTime;
    const remainingTime = this.timePerLevel - levelTime;

    // 记录本关用时
    window.__signals__.levelTimes.push(levelTime);

    // 记录关卡完成事件
    this.logEvent('level_complete', {
      level: this.currentLevel,
      time: levelTime,
      remainingTime: remainingTime
    });

    // 移除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 检查是否通关
    if (this.currentLevel >= this.totalLevels) {
      this.onGameComplete();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(200, () => {
        this.startLevel();
      });
    }
  }

  onLevelTimeout() {
    if (this.gameOver) return;

    this.gameOver = true;
    const totalTime = this.time.now - this.totalStartTime;

    // 更新signals
    window.__signals__.gameStatus = 'failed';
    window.__signals__.totalElapsedTime = totalTime;

    // 显示失败信息
    this.resultText.setText(`游戏失败！\n关卡 ${this.currentLevel} 超时\n总用时: ${(totalTime / 1000).toFixed(3)}秒`)
      .setColor('#ff0000')
      .setVisible(true);

    this.hintText.setVisible(false);
    this.timerText.setVisible(false);

    // 记录失败事件
    this.logEvent('game_failed', {
      level: this.currentLevel,
      totalTime: totalTime,
      reason: 'timeout'
    });
  }

  onGameComplete() {
    this.gameOver = true;
    const totalTime = this.time.now - this.totalStartTime;

    // 更新signals
    window.__signals__.gameStatus = 'completed';
    window.__signals__.totalElapsedTime = totalTime;

    // 显示成功信息
    this.resultText.setText(`恭喜通关！\n总用时: ${(totalTime / 1000).toFixed(3)}秒\n平均每关: ${(totalTime / this.totalLevels / 1000).toFixed(3)}秒`)
      .setColor('#00ff00')
      .setVisible(true);

    this.hintText.setVisible(false);
    this.timerText.setVisible(false);
    this.targetGraphics.clear();

    // 记录通关事件
    this.logEvent('game_complete', {
      totalTime: totalTime,
      averageTime: totalTime / this.totalLevels,
      levelTimes: window.__signals__.levelTimes
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 更新倒计时显示
    if (this.levelTimer && this.levelTimer.getRemaining) {
      const remaining = this.levelTimer.getRemaining();
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(3)}秒`);

      // 时间不足时变红
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }

    // 更新总用时显示
    const totalElapsed = time - this.totalStartTime;
    this.totalTimeText.setText(`总用时: ${(totalElapsed / 1000).toFixed(3)}秒`);
    window.__signals__.totalElapsedTime = totalElapsed;
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      time: this.time.now,
      ...data
    };
    window.__signals__.events.push(event);
    console.log('[GameEvent]', JSON.stringify(event));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
window.__game__ = game;