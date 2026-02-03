// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 10,
  levelTime: 0.5,
  totalTime: 0,
  gameState: 'playing', // playing, failed, completed
  clickCount: 0,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 10;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalElapsedTime = 0;
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    this.isGameOver = false;
    this.targetClicked = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.isGameOver = false;
    this.gameStartTime = this.time.now;
    
    // 创建UI背景
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x1a1a1a, 1);
    headerBg.fillRect(0, 0, 800, 80);

    // 创建文本显示
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(20, 50, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(400, 20, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 300, '点击绿色目标以通过关卡！', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();

    // 记录初始状态
    this.logEvent('game_start', {
      totalLevels: this.totalLevels,
      levelTimeLimit: this.levelTimeLimit
    });
  }

  startLevel() {
    if (this.currentLevel > this.totalLevels) {
      this.gameComplete();
      return;
    }

    this.targetClicked = false;
    this.levelStartTime = this.time.now;

    // 更新UI
    this.updateUI();

    // 清除之前的目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetHitArea) {
      this.targetHitArea.destroy();
    }

    // 创建目标区域（随机位置）
    const seed = this.currentLevel * 12345; // 固定种子保证可重现
    const random = this.seededRandom(seed);
    const targetX = 150 + random() * 500;
    const targetY = 150 + random() * 350;
    const targetSize = 60 - this.currentLevel * 3; // 关卡越高，目标越小

    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillCircle(targetX, targetY, targetSize);
    this.targetGraphics.lineStyle(3, 0xffffff, 1);
    this.targetGraphics.strokeCircle(targetX, targetY, targetSize);

    // 创建可点击区域
    this.targetHitArea = this.add.circle(targetX, targetY, targetSize, 0x00ff00, 0);
    this.targetHitArea.setInteractive();
    this.targetHitArea.on('pointerdown', () => this.onTargetClick());

    // 创建关卡计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => this.onLevelTimeout(),
      callbackScope: this
    });

    // 记录关卡开始
    this.logEvent('level_start', {
      level: this.currentLevel,
      targetX: Math.round(targetX),
      targetY: Math.round(targetY),
      targetSize: targetSize
    });

    // 更新全局信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.gameState = 'playing';
  }

  onTargetClick() {
    if (this.isGameOver || this.targetClicked) return;

    this.targetClicked = true;
    const levelTime = this.time.now - this.levelStartTime;

    // 视觉反馈
    if (this.targetGraphics) {
      this.targetGraphics.clear();
      this.targetGraphics.fillStyle(0xffff00, 1);
      this.targetGraphics.fillCircle(this.targetHitArea.x, this.targetHitArea.y, this.targetHitArea.radius);
    }

    // 记录点击
    window.__signals__.clickCount++;
    this.logEvent('target_clicked', {
      level: this.currentLevel,
      levelTime: levelTime
    });

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
    }

    // 延迟进入下一关
    this.time.delayedCall(200, () => {
      this.currentLevel++;
      this.startLevel();
    });
  }

  onLevelTimeout() {
    if (this.isGameOver || this.targetClicked) return;

    this.isGameOver = true;
    this.gameFailed();
  }

  gameFailed() {
    this.totalElapsedTime = (this.time.now - this.gameStartTime) / 1000;

    // 清除目标
    if (this.targetGraphics) this.targetGraphics.destroy();
    if (this.targetHitArea) this.targetHitArea.destroy();
    if (this.levelTimer) this.levelTimer.destroy();

    // 显示失败信息
    const failBg = this.add.graphics();
    failBg.fillStyle(0x000000, 0.8);
    failBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 250, '游戏失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 320, `失败关卡: ${this.currentLevel}/${this.totalLevels}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 360, `总用时: ${this.totalElapsedTime.toFixed(3)}秒`, {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 420, '点击任意位置重新开始', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.currentLevel = 1;
    });

    // 更新全局信号
    window.__signals__.gameState = 'failed';
    window.__signals__.totalTime = this.totalElapsedTime;
    this.logEvent('game_failed', {
      failedLevel: this.currentLevel,
      totalTime: this.totalElapsedTime
    });
  }

  gameComplete() {
    this.isGameOver = true;
    this.totalElapsedTime = (this.time.now - this.gameStartTime) / 1000;

    // 清除UI
    if (this.levelTimer) this.levelTimer.destroy();

    // 显示完成信息
    const completeBg = this.add.graphics();
    completeBg.fillStyle(0x000000, 0.8);
    completeBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 200, '恭喜通关！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 280, `完成所有 ${this.totalLevels} 关`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 330, `总用时: ${this.totalElapsedTime.toFixed(3)}秒`, {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const avgTime = (this.totalElapsedTime / this.totalLevels).toFixed(3);
    this.add.text(400, 380, `平均每关: ${avgTime}秒`, {
      fontSize: '20px',
      color: '#00ffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 450, '点击任意位置重新开始', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.currentLevel = 1;
    });

    // 更新全局信号
    window.__signals__.gameState = 'completed';
    window.__signals__.totalTime = this.totalElapsedTime;
    this.logEvent('game_completed', {
      totalLevels: this.totalLevels,
      totalTime: this.totalElapsedTime,
      avgTime: parseFloat(avgTime)
    });
  }

  update() {
    if (this.isGameOver) return;

    // 更新计时器显示
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    
    if (this.levelTimer && !this.isGameOver) {
      const remaining = this.levelTimer.getRemaining();
      const progress = (remaining / this.levelTimeLimit) * 100;
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(2)}秒`);
      
      // 根据剩余时间改变颜色
      if (progress < 30) {
        this.timerText.setColor('#ff0000');
      } else if (progress < 60) {
        this.timerText.setColor('#ff9900');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }

    const currentTotal = (this.time.now - this.gameStartTime) / 1000;
    this.totalTimeText.setText(`总用时: ${currentTotal.toFixed(2)}秒`);
  }

  // 固定种子随机数生成器
  seededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  // 记录事件到全局信号
  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      ...data
    };
    window.__signals__.events.push(event);
    console.log('[EVENT]', JSON.stringify(event));
  }
}

// 启动游戏
new Phaser.Game(config);