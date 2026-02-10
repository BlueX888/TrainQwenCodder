// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 12,
  levelTimeLimit: 2000, // 毫秒
  remainingTime: 2000,
  totalElapsedTime: 0,
  gameState: 'playing', // playing, failed, completed
  levelHistory: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 12;
    this.levelTimeLimit = 2000; // 2秒
    this.levelStartTime = 0;
    this.totalElapsedTime = 0;
    this.gameState = 'playing';
    this.levelTimer = null;
    this.remainingTime = 2000;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    this.titleText = this.add.text(400, 50, 'Level Timer Challenge', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建关卡显示
    this.levelText = this.add.text(400, 120, '', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建倒计时显示
    this.timerText = this.add.text(400, 160, '', {
      fontSize: '28px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建总用时显示
    this.totalTimeText = this.add.text(400, 200, '', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建目标区域（玩家需要点击）
    this.targetGraphics = this.add.graphics();
    this.targetX = 400;
    this.targetY = 350;
    this.targetRadius = 60;

    // 创建提示文本
    this.hintText = this.add.text(400, 480, 'Click the circle to pass the level!', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    this.detailText = this.add.text(400, 360, '', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5).setVisible(false);

    // 设置点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 开始第一关
    this.startLevel();

    // 输出初始信号
    this.updateSignals();
  }

  startLevel() {
    if (this.currentLevel > this.totalLevels) {
      this.completeGame();
      return;
    }

    this.gameState = 'playing';
    this.levelStartTime = this.time.now;
    this.remainingTime = this.levelTimeLimit;

    // 更新UI
    this.levelText.setText(`Level ${this.currentLevel} / ${this.totalLevels}`);
    this.updateTimerDisplay();
    this.totalTimeText.setText(`Total Time: ${(this.totalElapsedTime / 1000).toFixed(2)}s`);

    // 随机目标位置（保持在安全范围内）
    this.targetX = Phaser.Math.Between(150, 650);
    this.targetY = Phaser.Math.Between(250, 450);

    // 绘制目标
    this.drawTarget();

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    // 显示UI元素
    this.targetGraphics.setVisible(true);
    this.hintText.setVisible(true);
    this.resultText.setVisible(false);
    this.detailText.setVisible(false);

    // 更新信号
    this.updateSignals();

    console.log(`[Level ${this.currentLevel}] Started`);
  }

  drawTarget() {
    this.targetGraphics.clear();
    
    // 绘制外圈
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeCircle(this.targetX, this.targetY, this.targetRadius);
    
    // 绘制内圈
    this.targetGraphics.fillStyle(0x00ff00, 0.3);
    this.targetGraphics.fillCircle(this.targetX, this.targetY, this.targetRadius);
    
    // 绘制中心点
    this.targetGraphics.fillStyle(0xffff00, 1);
    this.targetGraphics.fillCircle(this.targetX, this.targetY, 8);
  }

  handleClick(pointer) {
    if (this.gameState !== 'playing') {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      pointer.x, pointer.y,
      this.targetX, this.targetY
    );

    if (distance <= this.targetRadius) {
      // 点击成功
      this.onLevelComplete();
    }
  }

  onLevelComplete() {
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;

    // 记录关卡历史
    window.__signals__.levelHistory.push({
      level: this.currentLevel,
      timeUsed: levelTime,
      success: true
    });

    console.log(`[Level ${this.currentLevel}] Completed in ${levelTime}ms`);

    // 清除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 进入下一关
    this.currentLevel++;
    
    if (this.currentLevel <= this.totalLevels) {
      // 短暂延迟后开始下一关
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    } else {
      this.completeGame();
    }
  }

  onLevelTimeout() {
    this.gameState = 'failed';
    
    // 记录失败
    window.__signals__.levelHistory.push({
      level: this.currentLevel,
      timeUsed: this.levelTimeLimit,
      success: false
    });

    console.log(`[Level ${this.currentLevel}] Failed - Timeout`);

    // 隐藏游戏元素
    this.targetGraphics.setVisible(false);
    this.hintText.setVisible(false);

    // 显示失败信息
    this.resultText.setText('GAME OVER').setColor('#ff0000').setVisible(true);
    this.detailText.setText(
      `Failed at Level ${this.currentLevel}\n` +
      `Total Time: ${(this.totalElapsedTime / 1000).toFixed(2)}s`
    ).setVisible(true);

    // 更新信号
    this.updateSignals();

    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  completeGame() {
    this.gameState = 'completed';

    // 隐藏游戏元素
    this.targetGraphics.setVisible(false);
    this.hintText.setVisible(false);

    // 显示胜利信息
    this.resultText.setText('VICTORY!').setColor('#00ff00').setVisible(true);
    this.detailText.setText(
      `All ${this.totalLevels} levels completed!\n` +
      `Total Time: ${(this.totalElapsedTime / 1000).toFixed(2)}s\n` +
      `Average: ${(this.totalElapsedTime / this.totalLevels / 1000).toFixed(2)}s per level`
    ).setVisible(true);

    // 更新信号
    this.updateSignals();

    console.log(`[Game] Completed in ${this.totalElapsedTime}ms`);
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  updateTimerDisplay() {
    if (this.levelTimer && this.gameState === 'playing') {
      this.remainingTime = this.levelTimeLimit - this.levelTimer.getElapsed();
      const seconds = Math.max(0, this.remainingTime / 1000);
      this.timerText.setText(`Time Left: ${seconds.toFixed(2)}s`);
      
      // 时间不足时变红
      if (seconds < 0.5) {
        this.timerText.setColor('#ff0000');
      } else if (seconds < 1) {
        this.timerText.setColor('#ff6600');
      } else {
        this.timerText.setColor('#ffaa00');
      }
    }
  }

  updateSignals() {
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.remainingTime = this.remainingTime;
    window.__signals__.totalElapsedTime = this.totalElapsedTime;
    window.__signals__.gameState = this.gameState;
  }

  update(time, delta) {
    if (this.gameState === 'playing') {
      this.updateTimerDisplay();
      this.updateSignals();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);