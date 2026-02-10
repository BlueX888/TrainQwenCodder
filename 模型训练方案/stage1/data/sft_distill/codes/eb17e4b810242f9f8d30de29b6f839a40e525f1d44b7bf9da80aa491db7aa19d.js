class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 3;
    this.timeLimit = 500; // 0.5秒 = 500毫秒
    this.levelStartTime = 0;
    this.totalTimeElapsed = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.levelTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化游戏状态
    this.currentLevel = 1;
    this.totalTimeElapsed = 0;
    this.gameOver = false;
    this.gameWon = false;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建关卡信息文本
    this.levelText = this.add.text(400, 50, `关卡: ${this.currentLevel}/${this.totalLevels}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建倒计时文本
    this.timerText = this.add.text(400, 100, '剩余时间: 0.500s', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建总用时文本
    this.totalTimeText = this.add.text(400, 150, `总用时: ${(this.totalTimeElapsed / 1000).toFixed(3)}s`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建提示文本
    this.hintText = this.add.text(400, 250, '按空格键完成关卡！', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建目标区域（用 Graphics 绘制）
    this.targetArea = this.add.graphics();
    this.targetArea.fillStyle(0x00ff00, 0.3);
    this.targetArea.fillRect(300, 350, 200, 100);
    this.targetArea.lineStyle(3, 0x00ff00, 1);
    this.targetArea.strokeRect(300, 350, 200, 100);

    // 创建玩家方块
    this.player = this.add.graphics();
    this.player.fillStyle(0xff0000, 1);
    this.player.fillRect(0, 0, 50, 50);
    this.player.x = 375;
    this.player.y = 400;

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 创建重新开始提示（初始隐藏）
    this.restartText = this.add.text(400, 400, '按 R 键重新开始', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);

    // 启动关卡
    this.startLevel();

    // 监听键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.gameOver && !this.gameWon) {
        this.completeLevel();
      }
    });

    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver || this.gameWon) {
        this.scene.restart();
      }
    });
  }

  startLevel() {
    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建倒计时定时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    this.levelTimer = this.time.addEvent({
      delay: this.timeLimit,
      callback: this.onTimeUp,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    this.hintText.setVisible(true);
    this.resultText.setVisible(false);
    this.restartText.setVisible(false);
  }

  completeLevel() {
    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTimeElapsed += levelTime;

    // 移除定时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }

    // 更新总用时显示
    this.totalTimeText.setText(`总用时: ${(this.totalTimeElapsed / 1000).toFixed(3)}s`);

    // 检查是否完成所有关卡
    if (this.currentLevel >= this.totalLevels) {
      this.winGame();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    }
  }

  onTimeUp() {
    // 超时失败
    this.gameOver = true;
    this.hintText.setVisible(false);
    
    this.resultText.setText('超时失败！');
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);
    
    this.restartText.setVisible(true);
    
    this.timerText.setText('剩余时间: 0.000s');
  }

  winGame() {
    // 游戏胜利
    this.gameWon = true;
    this.hintText.setVisible(false);
    
    this.resultText.setText(`通关成功！\n总用时: ${(this.totalTimeElapsed / 1000).toFixed(3)}s`);
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);
    
    this.restartText.setVisible(true);
  }

  update(time, delta) {
    if (!this.gameOver && !this.gameWon && this.levelTimer) {
      // 更新倒计时显示
      const remaining = this.levelTimer.getRemaining();
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(3)}s`);

      // 根据剩余时间改变颜色
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
      } else if (remaining < 300) {
        this.timerText.setColor('#ff9900');
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
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出游戏状态以便验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    totalLevels: scene.totalLevels,
    totalTimeElapsed: scene.totalTimeElapsed,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon,
    timeLimit: scene.timeLimit
  };
};