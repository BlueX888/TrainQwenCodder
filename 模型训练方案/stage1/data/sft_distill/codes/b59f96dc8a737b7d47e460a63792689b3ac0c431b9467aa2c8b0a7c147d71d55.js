class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalStartTime = 0;
    this.totalEndTime = 0;
    this.levelTimer = null;
    this.gameOver = false;
    this.gameWon = false;
    this.target = null;
    this.levelText = null;
    this.timerText = null;
    this.messageText = null;
    this.remainingTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化游戏状态
    this.currentLevel = 1;
    this.gameOver = false;
    this.gameWon = false;
    this.totalStartTime = this.time.now;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(400, 50, `关卡: ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '剩余时间: 0.500s', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.messageText = this.add.text(400, 150, '点击目标通关！', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    // 更新关卡显示
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.messageText.setText('点击目标通关！');
    this.messageText.setColor('#ffff00');

    // 清除旧目标
    if (this.target) {
      this.target.destroy();
    }

    // 创建新目标（随机位置）
    const x = Phaser.Math.Between(150, 650);
    const y = Phaser.Math.Between(250, 500);
    
    this.target = this.add.graphics();
    this.target.fillStyle(0xff0000, 1);
    this.target.fillCircle(x, y, 40);
    this.target.lineStyle(4, 0xffffff, 1);
    this.target.strokeCircle(x, y, 40);
    
    // 添加目标文字
    const targetText = this.add.text(x, y, `${this.currentLevel}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 设置交互区域
    const hitArea = new Phaser.Geom.Circle(x, y, 40);
    this.target.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    
    // 点击事件
    this.target.once('pointerdown', () => {
      if (this.gameOver || this.gameWon) return;
      
      // 停止计时器
      if (this.levelTimer) {
        this.levelTimer.remove();
      }

      // 通过当前关卡
      targetText.destroy();
      this.target.destroy();
      this.currentLevel++;

      if (this.currentLevel > this.maxLevel) {
        // 游戏胜利
        this.gameWon = true;
        this.totalEndTime = this.time.now;
        this.showVictory();
      } else {
        // 进入下一关
        this.time.delayedCall(200, () => {
          this.startLevel();
        });
      }
    });

    // 启动倒计时
    this.remainingTime = this.levelTimeLimit;
    this.updateTimerDisplay();

    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 使用重复事件更新倒计时显示
    this.levelTimer = this.time.addEvent({
      delay: 10, // 每10ms更新一次
      callback: () => {
        this.remainingTime -= 10;
        this.updateTimerDisplay();

        if (this.remainingTime <= 0) {
          // 超时失败
          this.levelTimer.remove();
          this.gameOver = true;
          targetText.destroy();
          this.showFailure();
        }
      },
      loop: true
    });
  }

  updateTimerDisplay() {
    const seconds = Math.max(0, this.remainingTime / 1000);
    this.timerText.setText(`剩余时间: ${seconds.toFixed(3)}s`);
    
    // 根据剩余时间改变颜色
    if (seconds > 0.3) {
      this.timerText.setColor('#00ff00');
    } else if (seconds > 0.15) {
      this.timerText.setColor('#ffff00');
    } else {
      this.timerText.setColor('#ff0000');
    }
  }

  showVictory() {
    const totalTime = (this.totalEndTime - this.totalStartTime) / 1000;
    
    this.messageText.setText(`恭喜通关！\n总用时: ${totalTime.toFixed(3)}秒`);
    this.messageText.setColor('#00ff00');
    this.messageText.setFontSize('28px');
    
    this.timerText.setText('');

    // 创建重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x4CAF50, 1);
    restartButton.fillRoundedRect(300, 400, 200, 60, 10);
    restartButton.lineStyle(3, 0xffffff, 1);
    restartButton.strokeRoundedRect(300, 400, 200, 60, 10);

    const restartText = this.add.text(400, 430, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const buttonHitArea = new Phaser.Geom.Rectangle(300, 400, 200, 60);
    restartButton.setInteractive(buttonHitArea, Phaser.Geom.Rectangle.Contains);
    
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  showFailure() {
    this.messageText.setText('超时失败！');
    this.messageText.setColor('#ff0000');
    this.messageText.setFontSize('32px');
    
    this.timerText.setText('');

    // 创建重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0xf44336, 1);
    restartButton.fillRoundedRect(300, 400, 200, 60, 10);
    restartButton.lineStyle(3, 0xffffff, 1);
    restartButton.strokeRoundedRect(300, 400, 200, 60, 10);

    const restartText = this.add.text(400, 430, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const buttonHitArea = new Phaser.Geom.Rectangle(300, 400, 200, 60);
    restartButton.setInteractive(buttonHitArea, Phaser.Geom.Rectangle.Contains);
    
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 主要逻辑在事件中处理
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

// 导出可验证的状态（用于测试）
window.gameState = {
  getCurrentLevel: () => game.scene.scenes[0].currentLevel,
  getMaxLevel: () => game.scene.scenes[0].maxLevel,
  isGameOver: () => game.scene.scenes[0].gameOver,
  isGameWon: () => game.scene.scenes[0].gameWon,
  getRemainingTime: () => game.scene.scenes[0].remainingTime,
  getTotalTime: () => {
    const scene = game.scene.scenes[0];
    if (scene.gameWon) {
      return (scene.totalEndTime - scene.totalStartTime) / 1000;
    }
    return 0;
  }
};