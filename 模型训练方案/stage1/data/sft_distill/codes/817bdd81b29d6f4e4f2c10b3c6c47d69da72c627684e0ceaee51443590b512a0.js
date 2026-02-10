// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 15,
  timeRemaining: 4,
  totalTimeUsed: 0,
  gameStatus: 'playing', // 'playing', 'failed', 'completed'
  levelStartTime: 0,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevels = 15;
    this.levelTimeLimit = 4000; // 4秒（毫秒）
    this.totalTimeUsed = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.isGameOver = false;
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
    this.levelText = this.add.text(400, 50, `关卡: 1/${this.maxLevels}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '剩余时间: 4.0s', {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.totalTimeText = this.add.text(400, 150, '总用时: 0.0s', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 250, '点击绿色目标完成关卡！', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建目标区域
    this.createTarget();

    // 开始第一关
    this.startLevel();

    // 记录日志
    this.logEvent('game_start', { level: 1 });
  }

  createTarget() {
    // 随机位置生成目标（使用关卡作为种子保证可重现）
    const seed = this.currentLevel * 12345;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    const minX = 150;
    const maxX = 650;
    const minY = 320;
    const maxY = 520;
    
    const targetX = minX + (maxX - minX) * pseudoRandom;
    const targetY = minY + (maxY - minY) * ((seed * 7919 + 13579) % 233280 / 233280);

    // 清除旧目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetHitZone) {
      this.targetHitZone.destroy();
    }

    // 绘制目标
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillCircle(targetX, targetY, 40);
    
    // 绘制中心点
    this.targetGraphics.fillStyle(0xffffff, 1);
    this.targetGraphics.fillCircle(targetX, targetY, 10);

    // 创建可交互区域
    this.targetHitZone = this.add.zone(targetX, targetY, 80, 80);
    this.targetHitZone.setInteractive();
    this.targetHitZone.on('pointerdown', () => {
      if (!this.isGameOver) {
        this.completeLevel();
      }
    });
  }

  startLevel() {
    this.levelStartTime = this.time.now;
    this.isGameOver = false;

    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevels}`);
    this.timerText.setColor('#00ff00');
    this.instructionText.setVisible(true);

    // 清除旧计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        this.failLevel();
      },
      callbackScope: this
    });

    // 更新信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.timeRemaining = 4;
    window.__signals__.gameStatus = 'playing';
    window.__signals__.levelStartTime = this.levelStartTime;
  }

  completeLevel() {
    if (this.isGameOver) return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTimeUsed += levelTime;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录日志
    this.logEvent('level_complete', {
      level: this.currentLevel,
      timeUsed: levelTime / 1000
    });

    // 检查是否通关
    if (this.currentLevel >= this.maxLevels) {
      this.winGame();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.createTarget();
      this.startLevel();
    }
  }

  failLevel() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    
    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录日志
    this.logEvent('level_failed', {
      level: this.currentLevel,
      reason: 'timeout'
    });

    // 更新信号
    window.__signals__.gameStatus = 'failed';

    // 显示失败界面
    const failBg = this.add.graphics();
    failBg.fillStyle(0x000000, 0.8);
    failBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 250, '游戏失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 320, `在第 ${this.currentLevel} 关超时`, {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 380, '点击重新开始', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  winGame() {
    this.isGameOver = true;

    // 记录日志
    this.logEvent('game_complete', {
      totalTimeUsed: this.totalTimeUsed / 1000,
      levels: this.maxLevels
    });

    // 更新信号
    window.__signals__.gameStatus = 'completed';
    window.__signals__.totalTimeUsed = this.totalTimeUsed / 1000;

    // 显示胜利界面
    const winBg = this.add.graphics();
    winBg.fillStyle(0x000000, 0.8);
    winBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 200, '恭喜通关！', {
      fontSize: '56px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 280, `完成 ${this.maxLevels} 关`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 340, `总用时: ${(this.totalTimeUsed / 1000).toFixed(2)}s`, {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const avgTime = this.totalTimeUsed / this.maxLevels / 1000;
    this.add.text(400, 400, `平均每关: ${avgTime.toFixed(2)}s`, {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(400, 480, '点击重新挑战', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  resetGame() {
    this.currentLevel = 1;
    this.totalTimeUsed = 0;
    this.isGameOver = false;
    
    window.__signals__.currentLevel = 1;
    window.__signals__.totalTimeUsed = 0;
    window.__signals__.gameStatus = 'playing';
    window.__signals__.logs = [];
  }

  logEvent(eventType, data) {
    const logEntry = {
      timestamp: this.time.now,
      event: eventType,
      ...data
    };
    window.__signals__.logs.push(logEntry);
    console.log('[Game Log]', JSON.stringify(logEntry));
  }

  update(time, delta) {
    if (this.isGameOver || !this.levelTimer) return;

    // 更新倒计时显示
    const remaining = this.levelTimer.getRemaining();
    const seconds = Math.max(0, remaining / 1000);
    
    this.timerText.setText(`剩余时间: ${seconds.toFixed(1)}s`);
    
    // 时间不足1秒时变红色
    if (seconds < 1) {
      this.timerText.setColor('#ff0000');
    } else if (seconds < 2) {
      this.timerText.setColor('#ffaa00');
    }

    // 更新总用时
    const currentTotal = this.totalTimeUsed + (time - this.levelStartTime);
    this.totalTimeText.setText(`总用时: ${(currentTotal / 1000).toFixed(1)}s`);

    // 更新信号
    window.__signals__.timeRemaining = seconds;
    window.__signals__.totalTimeUsed = currentTotal / 1000;
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