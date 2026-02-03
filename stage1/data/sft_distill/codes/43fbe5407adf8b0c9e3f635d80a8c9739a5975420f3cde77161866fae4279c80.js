// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 10,
  timePerLevel: 0.5,
  elapsedTime: 0,
  gameState: 'playing', // playing, won, failed
  levelResults: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 10;
    this.timePerLevel = 500; // 0.5秒 = 500毫秒
    this.totalElapsedTime = 0;
    this.gameStartTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.gameState = 'playing'; // playing, won, failed
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.gameStartTime = this.time.now;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI容器
    this.uiContainer = this.add.container(0, 0);
    
    // 关卡文本
    this.levelText = this.add.text(400, 50, `关卡 ${this.currentLevel}/${this.totalLevels}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.uiContainer.add(this.levelText);

    // 倒计时文本
    this.timerText = this.add.text(400, 100, '剩余时间: 0.50s', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);
    this.uiContainer.add(this.timerText);

    // 总用时文本
    this.totalTimeText = this.add.text(400, 150, '总用时: 0.00s', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
    this.uiContainer.add(this.totalTimeText);

    // 提示文本
    this.hintText = this.add.text(400, 200, '点击目标通关！', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    this.uiContainer.add(this.hintText);

    // 创建目标区域
    this.createTarget();

    // 启动当前关卡
    this.startLevel();

    // 更新信号
    this.updateSignals();
  }

  createTarget() {
    // 清除旧目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetText) {
      this.targetText.destroy();
    }

    // 创建目标图形
    this.targetGraphics = this.add.graphics();
    const targetX = 400;
    const targetY = 350;
    const targetSize = 100;

    // 绘制目标（圆形按钮）
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillCircle(targetX, targetY, targetSize / 2);
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeCircle(targetX, targetY, targetSize / 2);

    // 目标文本
    this.targetText = this.add.text(targetX, targetY, '点击', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 设置交互区域
    const hitArea = new Phaser.Geom.Circle(targetX, targetY, targetSize / 2);
    this.targetGraphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    
    this.targetGraphics.on('pointerdown', () => {
      if (this.gameState === 'playing') {
        this.completeLevel();
      }
    });

    // 添加悬停效果
    this.targetGraphics.on('pointerover', () => {
      if (this.gameState === 'playing') {
        this.targetGraphics.clear();
        this.targetGraphics.fillStyle(0x00cc00, 1);
        this.targetGraphics.fillCircle(targetX, targetY, targetSize / 2);
        this.targetGraphics.lineStyle(4, 0xffffff, 1);
        this.targetGraphics.strokeCircle(targetX, targetY, targetSize / 2);
      }
    });

    this.targetGraphics.on('pointerout', () => {
      if (this.gameState === 'playing') {
        this.targetGraphics.clear();
        this.targetGraphics.fillStyle(0x00ff00, 1);
        this.targetGraphics.fillCircle(targetX, targetY, targetSize / 2);
        this.targetGraphics.lineStyle(4, 0xffffff, 1);
        this.targetGraphics.strokeCircle(targetX, targetY, targetSize / 2);
      }
    });
  }

  startLevel() {
    this.levelStartTime = this.time.now;
    this.gameState = 'playing';

    // 清除旧的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建新的倒计时
    this.levelTimer = this.time.addEvent({
      delay: this.timePerLevel,
      callback: this.levelTimeout,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.levelText.setText(`关卡 ${this.currentLevel}/${this.totalLevels}`);
    this.hintText.setText('点击目标通关！');
    this.hintText.setColor('#aaaaaa');
  }

  completeLevel() {
    if (this.gameState !== 'playing') return;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 记录关卡用时
    const levelTime = this.time.now - this.levelStartTime;
    window.__signals__.levelResults.push({
      level: this.currentLevel,
      time: levelTime,
      success: true
    });

    console.log(`[Level ${this.currentLevel}] 完成！用时: ${(levelTime / 1000).toFixed(3)}s`);

    // 检查是否通关
    if (this.currentLevel >= this.totalLevels) {
      this.gameWon();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.createTarget();
      this.startLevel();
    }

    this.updateSignals();
  }

  levelTimeout() {
    if (this.gameState !== 'playing') return;

    this.gameState = 'failed';

    // 记录失败
    const levelTime = this.time.now - this.levelStartTime;
    window.__signals__.levelResults.push({
      level: this.currentLevel,
      time: levelTime,
      success: false,
      reason: 'timeout'
    });

    console.log(`[Level ${this.currentLevel}] 超时失败！`);

    // 显示失败信息
    this.showGameOver(false);
    this.updateSignals();
  }

  gameWon() {
    this.gameState = 'won';
    this.totalElapsedTime = this.time.now - this.gameStartTime;

    console.log(`[Game] 全部通关！总用时: ${(this.totalElapsedTime / 1000).toFixed(3)}s`);

    this.showGameOver(true);
    this.updateSignals();
  }

  showGameOver(won) {
    // 隐藏目标
    if (this.targetGraphics) {
      this.targetGraphics.setVisible(false);
    }
    if (this.targetText) {
      this.targetText.setVisible(false);
    }

    // 创建结果面板
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.8);
    panel.fillRect(150, 200, 500, 250);
    panel.lineStyle(4, won ? 0x00ff00 : 0xff0000, 1);
    panel.strokeRect(150, 200, 500, 250);

    const titleText = won ? '🎉 恭喜通关！' : '❌ 游戏失败';
    const titleColor = won ? '#00ff00' : '#ff0000';

    const title = this.add.text(400, 250, titleText, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (won) {
      this.totalElapsedTime = this.time.now - this.gameStartTime;
      const totalTime = this.add.text(400, 310, `总用时: ${(this.totalElapsedTime / 1000).toFixed(3)}秒`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0.5);

      const avgTime = this.add.text(400, 350, `平均每关: ${(this.totalElapsedTime / 1000 / this.totalLevels).toFixed(3)}秒`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }).setOrigin(0.5);
    } else {
      const failInfo = this.add.text(400, 310, `失败于第 ${this.currentLevel} 关`, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0.5);

      const reason = this.add.text(400, 350, '原因: 超时（超过0.5秒）', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ff8888'
      }).setOrigin(0.5);
    }

    const restartHint = this.add.text(400, 400, '刷新页面重新开始', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.hintText.setText('');
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新倒计时显示
      const remaining = this.levelTimer.getRemaining();
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(2)}s`);
      
      // 根据剩余时间改变颜色
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
      } else if (remaining < 300) {
        this.timerText.setColor('#ffaa00');
      } else {
        this.timerText.setColor('#00ff00');
      }

      // 更新总用时
      this.totalElapsedTime = time - this.gameStartTime;
      this.totalTimeText.setText(`总用时: ${(this.totalElapsedTime / 1000).toFixed(2)}s`);
    }
  }

  updateSignals() {
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.elapsedTime = this.totalElapsedTime / 1000;
    window.__signals__.gameState = this.gameState;
    
    console.log('[Signals]', JSON.stringify(window.__signals__, null, 2));
  }
}

// Phaser 游戏配置
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