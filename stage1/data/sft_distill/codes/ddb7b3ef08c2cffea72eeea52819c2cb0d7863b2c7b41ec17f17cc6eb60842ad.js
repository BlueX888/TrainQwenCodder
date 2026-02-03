// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, EndScene]
};

// 全局游戏状态（用于验证）
const gameState = {
  currentLevel: 1,
  totalLevels: 3,
  levelTimeLimit: 2000, // 2秒
  totalTime: 0,
  isGameOver: false,
  isSuccess: false
};

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 重置游戏状态
    gameState.currentLevel = 1;
    gameState.totalTime = 0;
    gameState.isGameOver = false;
    gameState.isSuccess = false;

    // 创建UI文本
    this.levelText = this.add.text(400, 50, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '', {
      fontSize: '28px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 150, '点击绿色方块通关！', {
      fontSize: '20px',
      fill: '#aaaaaa'
    }).setOrigin(0.5);

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;
    this.gameStartTime = this.time.now;

    // 创建目标区域
    this.createTarget();

    // 创建倒计时器
    this.createTimer();
  }

  createTarget() {
    // 随机位置（使用固定种子保证可重现）
    const seed = gameState.currentLevel * 12345;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;
    
    const x = 200 + pseudoRandom * 400;
    const y = 250 + ((seed % 100) / 100) * 200;
    const size = 80;

    // 绘制目标
    this.target = this.add.graphics();
    this.target.fillStyle(0x00ff00, 1);
    this.target.fillRect(x - size/2, y - size/2, size, size);

    // 添加边框
    this.target.lineStyle(4, 0xffffff, 1);
    this.target.strokeRect(x - size/2, y - size/2, size, size);

    // 设置交互区域
    this.targetZone = this.add.zone(x, y, size, size)
      .setInteractive({ useHandCursor: true });

    this.targetZone.on('pointerdown', () => {
      this.onTargetClicked();
    });

    // 添加脉冲动画
    this.tweens.add({
      targets: this.target,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  createTimer() {
    // 创建倒计时器
    this.levelTimer = this.time.addEvent({
      delay: gameState.levelTimeLimit,
      callback: this.onTimeOut,
      callbackScope: this,
      loop: false
    });

    // 更新显示
    this.updateUI();
  }

  onTargetClicked() {
    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 记录用时
    const levelTime = this.time.now - this.levelStartTime;
    gameState.totalTime += levelTime;

    // 清除当前目标
    if (this.target) {
      this.target.destroy();
    }
    if (this.targetZone) {
      this.targetZone.destroy();
    }

    // 显示成功提示
    const successText = this.add.text(400, 300, `第${gameState.currentLevel}关完成！`, {
      fontSize: '36px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: successText,
      alpha: 0,
      scale: 1.5,
      duration: 800,
      onComplete: () => {
        successText.destroy();
        this.nextLevel();
      }
    });
  }

  onTimeOut() {
    // 超时失败
    gameState.isGameOver = true;
    gameState.isSuccess = false;

    this.showFailMessage();
  }

  showFailMessage() {
    const failText = this.add.text(400, 300, '超时失败！', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('EndScene');
    });
  }

  nextLevel() {
    gameState.currentLevel++;

    if (gameState.currentLevel > gameState.totalLevels) {
      // 全部通关
      gameState.isGameOver = true;
      gameState.isSuccess = true;
      this.scene.start('EndScene');
    } else {
      // 进入下一关
      this.levelStartTime = this.time.now;
      this.createTarget();
      this.createTimer();
      this.updateUI();
    }
  }

  updateUI() {
    this.levelText.setText(`第 ${gameState.currentLevel} / ${gameState.totalLevels} 关`);
  }

  update(time, delta) {
    // 更新倒计时显示
    if (this.levelTimer && !gameState.isGameOver) {
      const remaining = this.levelTimer.getRemaining();
      const seconds = (remaining / 1000).toFixed(2);
      this.timerText.setText(`剩余时间: ${seconds}秒`);

      // 时间不足时变红
      if (remaining < 500) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }
  }
}

// 结束场景
class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRect(0, 0, 800, 600);

    // 结果标题
    const titleText = gameState.isSuccess ? '🎉 恭喜通关！' : '❌ 挑战失败';
    const titleColor = gameState.isSuccess ? '#00ff00' : '#ff0000';

    this.add.text(400, 150, titleText, {
      fontSize: '48px',
      fill: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示统计信息
    let statsY = 250;

    if (gameState.isSuccess) {
      // 总用时
      const totalSeconds = (gameState.totalTime / 1000).toFixed(2);
      this.add.text(400, statsY, `总用时: ${totalSeconds} 秒`, {
        fontSize: '32px',
        fill: '#ffffff'
      }).setOrigin(0.5);
      statsY += 50;

      // 平均每关用时
      const avgTime = (gameState.totalTime / gameState.totalLevels / 1000).toFixed(2);
      this.add.text(400, statsY, `平均每关: ${avgTime} 秒`, {
        fontSize: '24px',
        fill: '#aaaaaa'
      }).setOrigin(0.5);
      statsY += 50;

      // 评价
      let rating = '';
      if (gameState.totalTime < 3000) {
        rating = '⭐⭐⭐ 神速！';
      } else if (gameState.totalTime < 4500) {
        rating = '⭐⭐ 优秀！';
      } else {
        rating = '⭐ 不错！';
      }

      this.add.text(400, statsY, rating, {
        fontSize: '28px',
        fill: '#ffff00'
      }).setOrigin(0.5);
    } else {
      // 失败信息
      this.add.text(400, statsY, `失败于第 ${gameState.currentLevel} 关`, {
        fontSize: '28px',
        fill: '#ff9999'
      }).setOrigin(0.5);
      statsY += 50;

      this.add.text(400, statsY, '每关限时 2 秒，请加快速度！', {
        fontSize: '20px',
        fill: '#aaaaaa'
      }).setOrigin(0.5);
    }

    // 重新开始按钮
    this.createRestartButton();

    // 显示验证状态
    console.log('=== 游戏状态验证 ===');
    console.log('总关卡数:', gameState.totalLevels);
    console.log('完成关卡:', gameState.isSuccess ? gameState.totalLevels : gameState.currentLevel - 1);
    console.log('总用时(ms):', gameState.totalTime);
    console.log('是否成功:', gameState.isSuccess);
    console.log('是否结束:', gameState.isGameOver);
  }

  createRestartButton() {
    const buttonX = 400;
    const buttonY = 500;
    const buttonWidth = 200;
    const buttonHeight = 60;

    // 按钮背景
    const button = this.add.graphics();
    button.fillStyle(0x4CAF50, 1);
    button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
    button.lineStyle(3, 0xffffff, 1);
    button.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);

    // 按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '重新开始', {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 交互区域
    const buttonZone = this.add.zone(buttonX, buttonY, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true });

    buttonZone.on('pointerover', () => {
      button.clear();
      button.fillStyle(0x66BB6A, 1);
      button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
    });

    buttonZone.on('pointerout', () => {
      button.clear();
      button.fillStyle(0x4CAF50, 1);
      button.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
      button.lineStyle(3, 0xffffff, 1);
      button.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, 10);
    });

    buttonZone.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

// 启动游戏
new Phaser.Game(config);