// 全局状态管理
const gameState = {
  currentLevel: 1,
  maxLevel: 5,
  levelTimeLimit: 4000, // 4秒
  totalElapsedTime: 0,
  gameStartTime: 0,
  levelStartTime: 0
};

// 主菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 标题
    const title = this.add.text(width / 2, height / 3, '限时闯关游戏', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 游戏说明
    const instructions = this.add.text(width / 2, height / 2, 
      '共5关，每关限时4秒\n点击绿色方块通关\n超时则游戏失败', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // 开始按钮
    const startButton = this.add.graphics();
    startButton.fillStyle(0x16c79a, 1);
    startButton.fillRoundedRect(width / 2 - 100, height * 0.7 - 30, 200, 60, 10);

    const startText = this.add.text(width / 2, height * 0.7, '开始游戏', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);

    // 按钮交互
    const buttonZone = this.add.zone(width / 2, height * 0.7, 200, 60);
    buttonZone.setInteractive({ useHandCursor: true });
    
    buttonZone.on('pointerover', () => {
      startButton.clear();
      startButton.fillStyle(0x19d9a8, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.7 - 30, 200, 60, 10);
    });

    buttonZone.on('pointerout', () => {
      startButton.clear();
      startButton.fillStyle(0x16c79a, 1);
      startButton.fillRoundedRect(width / 2 - 100, height * 0.7 - 30, 200, 60, 10);
    });

    buttonZone.on('pointerdown', () => {
      // 重置游戏状态
      gameState.currentLevel = 1;
      gameState.totalElapsedTime = 0;
      gameState.gameStartTime = this.time.now;
      this.scene.start('GameScene');
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.countdownTimer = null;
    this.remainingTime = 0;
    this.timerText = null;
    this.target = null;
  }

  create() {
    const { width, height } = this.cameras.main;
    gameState.levelStartTime = this.time.now;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // 关卡信息
    const levelText = this.add.text(width / 2, 50, `第 ${gameState.currentLevel} / ${gameState.maxLevel} 关`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    levelText.setOrigin(0.5);

    // 倒计时显示
    this.remainingTime = gameState.levelTimeLimit;
    this.timerText = this.add.text(width / 2, 120, `剩余时间: ${(this.remainingTime / 1000).toFixed(1)}s`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffcc00'
    });
    this.timerText.setOrigin(0.5);

    // 任务提示
    const hint = this.add.text(width / 2, 180, '点击绿色方块通关！', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hint.setOrigin(0.5);

    // 创建目标方块（随机位置）
    const seed = gameState.currentLevel * 12345;
    const random = this.createSeededRandom(seed);
    const targetX = random() * (width - 200) + 100;
    const targetY = random() * (height - 400) + 250;
    const targetSize = 80;

    this.target = this.add.graphics();
    this.target.fillStyle(0x16c79a, 1);
    this.target.fillRoundedRect(targetX - targetSize / 2, targetY - targetSize / 2, targetSize, targetSize, 8);

    // 添加发光效果
    const glow = this.add.graphics();
    glow.lineStyle(4, 0x19d9a8, 0.6);
    glow.strokeRoundedRect(targetX - targetSize / 2 - 5, targetY - targetSize / 2 - 5, targetSize + 10, targetSize + 10, 8);

    // 目标交互区域
    const targetZone = this.add.zone(targetX, targetY, targetSize, targetSize);
    targetZone.setInteractive({ useHandCursor: true });

    targetZone.on('pointerdown', () => {
      this.completeLevel();
    });

    // 倒计时定时器
    this.countdownTimer = this.time.addEvent({
      delay: 100, // 每100ms更新一次
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  createSeededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  updateTimer() {
    this.remainingTime -= 100;

    if (this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.gameFailed();
      return;
    }

    this.timerText.setText(`剩余时间: ${(this.remainingTime / 1000).toFixed(1)}s`);

    // 时间紧张时变红
    if (this.remainingTime <= 1000) {
      this.timerText.setColor('#ff4444');
    } else if (this.remainingTime <= 2000) {
      this.timerText.setColor('#ff9944');
    }
  }

  completeLevel() {
    if (this.countdownTimer) {
      this.countdownTimer.remove();
      this.countdownTimer = null;
    }

    // 计算本关用时
    const levelTime = this.time.now - gameState.levelStartTime;
    gameState.totalElapsedTime += levelTime;

    if (gameState.currentLevel >= gameState.maxLevel) {
      // 全部通关
      this.scene.start('EndScene', { success: true });
    } else {
      // 进入下一关
      gameState.currentLevel++;
      this.scene.restart();
    }
  }

  gameFailed() {
    if (this.countdownTimer) {
      this.countdownTimer.remove();
      this.countdownTimer = null;
    }

    this.scene.start('EndScene', { success: false });
  }
}

// 结束场景
class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create(data) {
    const { width, height } = this.cameras.main;
    const success = data.success || false;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(success ? 0x1a472a : 0x4a1a1a, 1);
    bg.fillRect(0, 0, width, height);

    // 结果标题
    const resultTitle = this.add.text(width / 2, height / 3, 
      success ? '🎉 恭喜通关！' : '❌ 挑战失败', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    resultTitle.setOrigin(0.5);

    if (success) {
      // 显示总用时
      const totalSeconds = (gameState.totalElapsedTime / 1000).toFixed(2);
      const timeText = this.add.text(width / 2, height / 2 - 20, 
        `总用时: ${totalSeconds} 秒`, {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffcc00'
      });
      timeText.setOrigin(0.5);

      // 评价
      let rating = '';
      if (gameState.totalElapsedTime < 10000) {
        rating = '⭐⭐⭐ 神速！';
      } else if (gameState.totalElapsedTime < 15000) {
        rating = '⭐⭐ 不错！';
      } else {
        rating = '⭐ 继续加油！';
      }

      const ratingText = this.add.text(width / 2, height / 2 + 30, rating, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff'
      });
      ratingText.setOrigin(0.5);
    } else {
      // 失败信息
      const failInfo = this.add.text(width / 2, height / 2, 
        `在第 ${gameState.currentLevel} 关超时`, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffaaaa'
      });
      failInfo.setOrigin(0.5);
    }

    // 重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x16c79a, 1);
    restartButton.fillRoundedRect(width / 2 - 100, height * 0.75 - 30, 200, 60, 10);

    const restartText = this.add.text(width / 2, height * 0.75, '重新开始', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);

    const buttonZone = this.add.zone(width / 2, height * 0.75, 200, 60);
    buttonZone.setInteractive({ useHandCursor: true });
    
    buttonZone.on('pointerover', () => {
      restartButton.clear();
      restartButton.fillStyle(0x19d9a8, 1);
      restartButton.fillRoundedRect(width / 2 - 100, height * 0.75 - 30, 200, 60, 10);
    });

    buttonZone.on('pointerout', () => {
      restartButton.clear();
      restartButton.fillStyle(0x16c79a, 1);
      restartButton.fillRoundedRect(width / 2 - 100, height * 0.75 - 30, 200, 60, 10);
    });

    buttonZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene, EndScene]
};

// 启动游戏
new Phaser.Game(config);