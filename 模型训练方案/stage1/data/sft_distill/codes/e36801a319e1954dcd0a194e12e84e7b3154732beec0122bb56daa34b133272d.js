// 全局信号对象
window.__signals__ = {
  currentLevel: 1,
  totalLevels: 15,
  timePerLevel: 4,
  totalTimeUsed: 0,
  levelTimeUsed: 0,
  gameState: 'playing', // playing, failed, completed
  levelsPassed: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 15;
    this.timePerLevel = 4000; // 4秒（毫秒）
    this.totalTimeUsed = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.timeRemaining = 4;
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
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(20, 50, '', {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(20, 90, '', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 500, '点击目标通过关卡！', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清理之前的计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
    }

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;
    this.timeRemaining = this.timePerLevel / 1000;

    // 更新UI
    this.updateUI();

    // 创建目标物体
    this.createTarget();

    // 创建倒计时器
    this.levelTimer = this.time.addEvent({
      delay: 100, // 每100毫秒更新一次
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 更新信号
    window.__signals__.currentLevel = this.currentLevel;
    window.__signals__.gameState = 'playing';
    window.__signals__.levelTimeUsed = 0;
  }

  createTarget() {
    // 移除旧目标（如果存在）
    if (this.target) {
      this.target.destroy();
    }

    // 随机位置（使用关卡数作为种子保证可重现）
    const seed = this.currentLevel * 12345;
    const random = this.seededRandom(seed);
    
    const x = 150 + random() * 500;
    const y = 150 + random() * 300;
    const size = 60 - this.currentLevel * 2; // 关卡越高，目标越小

    // 创建目标图形
    this.target = this.add.graphics();
    this.target.fillStyle(0xff0000, 1);
    this.target.fillCircle(0, 0, size);
    this.target.lineStyle(4, 0xffffff, 1);
    this.target.strokeCircle(0, 0, size);
    this.target.setPosition(x, y);

    // 添加交互
    const hitArea = new Phaser.Geom.Circle(0, 0, size);
    this.target.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    
    this.target.on('pointerdown', () => {
      this.onTargetClicked();
    });

    // 添加脉动效果
    this.tweens.add({
      targets: this.target,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  updateTimer() {
    const elapsed = this.time.now - this.levelStartTime;
    this.timeRemaining = Math.max(0, (this.timePerLevel - elapsed) / 1000);

    // 更新UI
    this.timerText.setText(`时间: ${this.timeRemaining.toFixed(2)}s`);
    
    // 更新信号
    window.__signals__.levelTimeUsed = elapsed / 1000;

    // 检查是否超时
    if (this.timeRemaining <= 0) {
      this.onLevelFailed();
    }
  }

  onTargetClicked() {
    // 计算本关用时
    const levelTime = (this.time.now - this.levelStartTime) / 1000;
    this.totalTimeUsed += levelTime;

    // 更新信号
    window.__signals__.totalTimeUsed = this.totalTimeUsed;
    window.__signals__.levelsPassed = this.currentLevel;

    console.log(`关卡 ${this.currentLevel} 完成，用时: ${levelTime.toFixed(2)}s`);

    // 检查是否通关所有关卡
    if (this.currentLevel >= this.totalLevels) {
      this.onGameCompleted();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.startLevel();
    }
  }

  onLevelFailed() {
    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
      this.levelTimer = null;
    }

    // 更新信号
    window.__signals__.gameState = 'failed';

    // 移除目标
    if (this.target) {
      this.target.destroy();
    }

    // 显示失败界面
    const failBg = this.add.graphics();
    failBg.fillStyle(0x000000, 0.8);
    failBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 250, '游戏失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 320, `失败于第 ${this.currentLevel} 关`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 360, `总用时: ${this.totalTimeUsed.toFixed(2)}s`, {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartBtn = this.add.graphics();
    restartBtn.fillStyle(0x00aa00, 1);
    restartBtn.fillRoundedRect(300, 400, 200, 50, 10);
    restartBtn.setInteractive(
      new Phaser.Geom.Rectangle(300, 400, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(400, 425, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    console.log('游戏失败，超时于关卡', this.currentLevel);
  }

  onGameCompleted() {
    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.destroy();
      this.levelTimer = null;
    }

    // 更新信号
    window.__signals__.gameState = 'completed';
    window.__signals__.levelsPassed = this.totalLevels;

    // 移除目标
    if (this.target) {
      this.target.destroy();
    }

    // 显示胜利界面
    const winBg = this.add.graphics();
    winBg.fillStyle(0x000000, 0.9);
    winBg.fillRect(0, 0, 800, 600);

    this.add.text(400, 200, '恭喜通关！', {
      fontSize: '56px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 280, `完成 ${this.totalLevels} 关`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 330, `总用时: ${this.totalTimeUsed.toFixed(2)} 秒`, {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const avgTime = this.totalTimeUsed / this.totalLevels;
    this.add.text(400, 380, `平均每关: ${avgTime.toFixed(2)} 秒`, {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartBtn = this.add.graphics();
    restartBtn.fillStyle(0x0066cc, 1);
    restartBtn.fillRoundedRect(300, 440, 200, 50, 10);
    restartBtn.setInteractive(
      new Phaser.Geom.Rectangle(300, 440, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(400, 465, '再玩一次', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    console.log('游戏通关！总用时:', this.totalTimeUsed.toFixed(2), '秒');
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel} / ${this.totalLevels}`);
    this.totalTimeText.setText(`总用时: ${this.totalTimeUsed.toFixed(2)}s`);
  }

  // 简单的伪随机数生成器（可重现）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
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

// 创建游戏实例
new Phaser.Game(config);