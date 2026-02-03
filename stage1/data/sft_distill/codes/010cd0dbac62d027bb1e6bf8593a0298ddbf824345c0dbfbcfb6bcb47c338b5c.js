// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 15,
  levelTime: 0,
  totalTime: 0,
  gameState: 'playing', // playing, failed, completed
  levelTimes: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 15;
    this.levelTimeLimit = 4000; // 4秒
    this.levelStartTime = 0;
    this.totalElapsedTime = 0;
    this.levelTimes = [];
    this.levelTimer = null;
    this.gameState = 'playing';
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  create() {
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

    this.timerText = this.add.text(20, 50, '', {
      fontSize: '20px',
      color: '#00ff00'
    });

    this.totalTimeText = this.add.text(20, 80, '', {
      fontSize: '18px',
      color: '#ffff00'
    });

    this.instructionText = this.add.text(400, 500, '点击目标通过关卡！', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  update(time, delta) {
    if (this.gameState !== 'playing') return;

    // 更新倒计时显示
    const elapsed = time - this.levelStartTime;
    const remaining = Math.max(0, this.levelTimeLimit - elapsed);
    const remainingSeconds = (remaining / 1000).toFixed(2);
    
    this.timerText.setText(`剩余时间: ${remainingSeconds}s`);
    
    // 更新颜色警告
    if (remaining < 1000) {
      this.timerText.setColor('#ff0000');
    } else if (remaining < 2000) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#00ff00');
    }

    // 更新总用时
    const totalSeconds = ((this.totalElapsedTime + elapsed) / 1000).toFixed(2);
    this.totalTimeText.setText(`总用时: ${totalSeconds}s`);

    // 更新信号
    window.__signals__.levelTime = elapsed;
    window.__signals__.totalTime = this.totalElapsedTime + elapsed;
  }

  createTextures() {
    // 创建目标纹理（圆形）
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(32, 32, 32);
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeCircle(32, 32, 32);
    graphics.generateTexture('target', 64, 64);
    graphics.destroy();

    // 创建失败标记纹理
    const failGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    failGraphics.fillStyle(0xff0000, 1);
    failGraphics.fillCircle(32, 32, 32);
    failGraphics.generateTexture('fail', 64, 64);
    failGraphics.destroy();
  }

  startLevel() {
    this.gameState = 'playing';
    this.levelStartTime = this.time.now;

    // 更新关卡显示
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);

    // 清除之前的目标
    if (this.target) {
      this.target.destroy();
    }

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 创建随机位置的目标（使用固定种子保证可重现）
    const seed = this.currentLevel * 123456;
    const x = 200 + ((seed * 9301 + 49297) % 233280) / 233280 * 400;
    const y = 150 + ((seed * 9301 + 49297) % 233280) / 233280 * 300;

    this.target = this.add.sprite(x, y, 'target');
    this.target.setInteractive({ useHandCursor: true });
    
    // 添加缩放动画
    this.tweens.add({
      targets: this.target,
      scale: { from: 0.8, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 点击目标通关
    this.target.on('pointerdown', () => {
      if (this.gameState === 'playing') {
        this.completeLevel();
      }
    });

    // 设置关卡倒计时
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: () => {
        this.failLevel();
      },
      callbackScope: this
    });

    // 更新信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.gameState = 'playing';
  }

  completeLevel() {
    const elapsed = this.time.now - this.levelStartTime;
    this.levelTimes.push(elapsed);
    this.totalElapsedTime += elapsed;

    // 更新信号
    window.__signals__.levelTimes = [...this.levelTimes];

    // 移除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 显示通关效果
    this.target.setTexture('target');
    this.tweens.add({
      targets: this.target,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.target.destroy();
        
        // 检查是否完成所有关卡
        if (this.currentLevel >= this.totalLevels) {
          this.showVictory();
        } else {
          this.currentLevel++;
          this.time.delayedCall(500, () => {
            this.startLevel();
          });
        }
      }
    });
  }

  failLevel() {
    this.gameState = 'failed';
    window.__signals__.gameState = 'failed';

    // 停止所有动画
    this.tweens.killAll();

    // 显示失败效果
    if (this.target) {
      this.target.setTexture('fail');
    }

    // 显示失败信息
    const failText = this.add.text(400, 300, '超时失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const statsText = this.add.text(400, 360, 
      `已完成关卡: ${this.currentLevel - 1}/${this.totalLevels}\n` +
      `总用时: ${(this.totalElapsedTime / 1000).toFixed(2)}s`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const retryText = this.add.text(400, 450, '点击重新开始', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryText.on('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });

    this.instructionText.setVisible(false);
  }

  showVictory() {
    this.gameState = 'completed';
    window.__signals__.gameState = 'completed';

    // 清除UI
    this.instructionText.setVisible(false);

    // 显示胜利信息
    const victoryText = this.add.text(400, 200, '恭喜通关！', {
      fontSize: '56px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示统计信息
    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);
    const avgTime = (this.totalElapsedTime / this.totalLevels / 1000).toFixed(2);

    const statsText = this.add.text(400, 300, 
      `完成关卡: ${this.totalLevels}/${this.totalLevels}\n` +
      `总用时: ${totalSeconds}s\n` +
      `平均用时: ${avgTime}s/关`, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // 显示每关详细用时
    let detailText = '各关用时:\n';
    this.levelTimes.forEach((time, index) => {
      detailText += `关卡${index + 1}: ${(time / 1000).toFixed(2)}s  `;
      if ((index + 1) % 5 === 0) detailText += '\n';
    });

    const detailDisplay = this.add.text(400, 420, detailText, {
      fontSize: '14px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    const retryText = this.add.text(400, 540, '点击重新挑战', {
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryText.on('pointerdown', () => {
      this.scene.restart();
      this.resetGame();
    });

    // 胜利动画
    this.tweens.add({
      targets: victoryText,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  resetGame() {
    this.currentLevel = 1;
    this.totalElapsedTime = 0;
    this.levelTimes = [];
    this.gameState = 'playing';
    
    window.__signals__.currentLevel = 1;
    window.__signals__.totalTime = 0;
    window.__signals__.levelTimes = [];
    window.__signals__.gameState = 'playing';
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

// 导出验证函数
window.getGameState = () => {
  return {
    signals: window.__signals__,
    timestamp: Date.now()
  };
};

console.log('游戏已启动 - 15关限时挑战');
console.log('规则: 每关4秒限时，点击绿色目标通关');
console.log('验证信号可通过 window.__signals__ 访问');