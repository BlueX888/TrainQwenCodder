class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 500; // 0.5秒 = 500毫秒
    this.totalElapsedTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
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

    // 创建目标区域纹理
    this.createTargetTexture();

    // UI文本
    this.levelText = this.add.text(width / 2, 50, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, 100, '', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(width / 2, 150, '点击绿色方块通过关卡！', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.totalTimeText = this.add.text(width / 2, height - 50, '', {
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5);

    // 结果文本（初始隐藏）
    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 开始第一关
    this.startLevel();
  }

  createTargetTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 100, 100);
    graphics.generateTexture('target', 100, 100);
    graphics.destroy();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    const { width, height } = this.cameras.main;

    // 清除旧的目标
    if (this.target) {
      this.target.destroy();
    }

    // 清除旧的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 更新关卡信息
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.instructionText.setVisible(true);

    // 随机位置生成目标（确保不超出边界）
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(200, height - 150);

    this.target = this.add.sprite(x, y, 'target').setInteractive();
    
    // 添加点击事件
    this.target.on('pointerdown', () => {
      this.completeLevel();
    });

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建倒计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        this.failLevel();
      },
      callbackScope: this
    });
  }

  completeLevel() {
    if (this.gameOver || this.gameWon) return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;

    // 更新总用时显示
    this.totalTimeText.setText(`总用时: ${(this.totalElapsedTime / 1000).toFixed(3)}秒`);

    // 检查是否通过所有关卡
    if (this.currentLevel >= this.maxLevel) {
      this.winGame();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.startLevel();
    }
  }

  failLevel() {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;

    // 清除目标
    if (this.target) {
      this.target.destroy();
    }

    // 隐藏指令
    this.instructionText.setVisible(false);
    this.timerText.setVisible(false);

    // 显示失败信息
    this.resultText.setText(`游戏失败！\n未能在 ${this.levelTimeLimit}ms 内完成关卡 ${this.currentLevel}`);
    this.resultText.setColor('#ff0000');
    this.resultText.setVisible(true);

    // 添加重新开始提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        '点击任意位置重新开始',
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
    });
  }

  winGame() {
    this.gameWon = true;

    // 清除目标
    if (this.target) {
      this.target.destroy();
    }

    // 隐藏指令
    this.instructionText.setVisible(false);
    this.timerText.setVisible(false);

    // 显示成功信息
    this.resultText.setText(`恭喜通关！\n总用时: ${(this.totalElapsedTime / 1000).toFixed(3)}秒`);
    this.resultText.setColor('#00ff00');
    this.resultText.setVisible(true);

    // 添加重新开始提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        '点击任意位置重新挑战',
        { fontSize: '24px', color: '#ffffff' }
      ).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 更新倒计时显示
    if (this.levelTimer) {
      const remaining = this.levelTimeLimit - this.levelTimer.getElapsed();
      this.timerText.setText(`剩余时间: ${Math.max(0, remaining).toFixed(0)}ms`);

      // 时间不足时变红
      if (remaining < 200) {
        this.timerText.setColor('#ff0000');
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
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  // 可验证的状态信号通过 scene 的公共属性访问
  // 例如: game.scene.scenes[0].currentLevel, game.scene.scenes[0].totalElapsedTime
};

const game = new Phaser.Game(config);

// 导出状态访问函数（用于验证）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const scene = game.scene.scenes[0];
    return {
      currentLevel: scene.currentLevel,
      maxLevel: scene.maxLevel,
      totalElapsedTime: scene.totalElapsedTime,
      gameOver: scene.gameOver,
      gameWon: scene.gameWon
    };
  };
}