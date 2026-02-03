class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 15;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.levelTimeLimit = 1000; // 1秒 = 1000毫秒
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

    // 创建UI文本
    this.levelText = this.add.text(20, 20, `关卡: ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(20, 60, '剩余时间: 1.00s', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(20, 100, '总用时: 0.00s', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(width / 2, height / 2 - 100, '点击绿色方块通关！', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建目标方块（使用Graphics生成纹理）
    this.createTargetTexture();
    
    // 开始第一关
    this.startLevel();

    // 添加键盘重启功能
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver || this.gameWon) {
        this.scene.restart();
      }
    });
  }

  createTargetTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('target', 80, 80);
    graphics.destroy();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;

    // 清除之前的目标
    if (this.target) {
      this.target.destroy();
    }

    // 清除之前的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;
    this.levelRemainingTime = this.levelTimeLimit;

    // 创建新的目标方块（随机位置）
    const { width, height } = this.cameras.main;
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(200, height - 100);

    this.target = this.add.sprite(x, y, 'target').setInteractive();
    
    // 添加点击事件
    this.target.on('pointerdown', () => {
      this.onTargetClicked();
    });

    // 添加悬停效果
    this.target.on('pointerover', () => {
      this.target.setScale(1.1);
    });

    this.target.on('pointerout', () => {
      this.target.setScale(1);
    });

    // 启动关卡计时器（1秒后超时）
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.instructionText.setVisible(true);
  }

  onTargetClicked() {
    if (this.gameOver || this.gameWon) return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 移除当前关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 检查是否通关
    if (this.currentLevel >= this.maxLevel) {
      this.onGameWon();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.startLevel();
    }
  }

  onLevelTimeout() {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;

    // 隐藏目标
    if (this.target) {
      this.target.destroy();
    }

    // 显示失败信息
    const { width, height } = this.cameras.main;
    
    const failBg = this.add.graphics();
    failBg.fillStyle(0x000000, 0.8);
    failBg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 50, '游戏失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, `在第 ${this.currentLevel} 关超时`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 80, '按 R 键重新开始', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText.setVisible(false);
  }

  onGameWon() {
    this.gameWon = true;

    // 隐藏目标
    if (this.target) {
      this.target.destroy();
    }

    // 显示胜利信息
    const { width, height } = this.cameras.main;
    
    const winBg = this.add.graphics();
    winBg.fillStyle(0x000000, 0.8);
    winBg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2 - 80, '恭喜通关！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const totalSeconds = (this.totalTime / 1000).toFixed(2);
    this.add.text(width / 2, height / 2, `总用时: ${totalSeconds} 秒`, {
      fontSize: '32px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, `完成 ${this.maxLevel} 关`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 120, '按 R 键重新开始', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 更新倒计时显示
    if (this.levelTimer && this.levelTimer.getRemaining) {
      const remaining = this.levelTimer.getRemaining() / 1000;
      this.timerText.setText(`剩余时间: ${remaining.toFixed(2)}s`);
      
      // 时间不足0.3秒时变红
      if (remaining < 0.3) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#00ff00');
      }
    }

    // 更新总用时显示
    const currentTotal = this.totalTime + (this.time.now - this.levelStartTime);
    const totalSeconds = (currentTotal / 1000).toFixed(2);
    this.totalTimeText.setText(`总用时: ${totalSeconds}s`);
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
const game = new Phaser.Game(config);

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    totalTime: scene.totalTime,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon,
    levelTimeLimit: scene.levelTimeLimit
  };
};