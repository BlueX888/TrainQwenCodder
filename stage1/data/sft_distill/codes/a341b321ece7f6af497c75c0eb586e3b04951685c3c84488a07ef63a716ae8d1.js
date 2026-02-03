class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 8;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.levelTimer = null;
    this.remainingTime = 1000; // 每关1秒 = 1000ms
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 重置游戏状态
    this.currentLevel = 1;
    this.totalTime = 0;
    this.levelStartTime = this.time.now;
    this.gameOver = false;
    this.gameWon = false;
    this.remainingTime = 1000;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(20, 20, `关卡: ${this.currentLevel}/${this.totalLevels}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timeText = this.add.text(20, 60, '剩余时间: 1.00s', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(20, 100, '总用时: 0.00s', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建目标区域（玩家需要点击的区域）
    this.createTargetArea();

    // 启动关卡计时器
    this.startLevelTimer();

    // 添加输入监听
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  createTargetArea() {
    // 清除旧的目标区域
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetZone) {
      this.targetZone.destroy();
    }

    // 使用确定性的位置生成（基于关卡数）
    const seed = this.currentLevel * 123;
    const x = 200 + ((seed * 17) % 400);
    const y = 200 + ((seed * 31) % 200);
    const size = 80 - (this.currentLevel - 1) * 5; // 关卡越高，目标越小

    // 绘制目标区域
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x00ff00, 0.6);
    this.targetGraphics.fillCircle(x, y, size);
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeCircle(x, y, size);

    // 添加目标文字
    this.targetText = this.add.text(x, y, '点击', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建可交互区域
    this.targetZone = this.add.zone(x, y, size * 2, size * 2);
    this.targetZone.setInteractive();
    this.targetZone.setData('targetX', x);
    this.targetZone.setData('targetY', y);
    this.targetZone.setData('targetSize', size);
  }

  startLevelTimer() {
    // 清除旧的计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 重置剩余时间
    this.remainingTime = 1000;
    this.levelStartTime = this.time.now;

    // 创建新的计时器
    this.levelTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });
  }

  onLevelTimeout() {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;
    this.statusText.setText('超时失败！\n点击重新开始');
    this.statusText.setColor('#ff0000');
    this.timeText.setColor('#ff0000');

    // 禁用目标区域
    if (this.targetZone) {
      this.targetZone.disableInteractive();
    }

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  onPointerDown(pointer) {
    if (this.gameOver || this.gameWon) return;

    // 检查是否点击在目标区域内
    if (this.targetZone) {
      const targetX = this.targetZone.getData('targetX');
      const targetY = this.targetZone.getData('targetY');
      const targetSize = this.targetZone.getData('targetSize');

      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, targetX, targetY);

      if (distance <= targetSize) {
        // 点击成功
        this.onLevelComplete();
      }
    }
  }

  onLevelComplete() {
    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 检查是否通关
    if (this.currentLevel >= this.totalLevels) {
      this.onGameWon();
      return;
    }

    // 进入下一关
    this.currentLevel++;
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.totalLevels}`);
    
    // 显示过关提示
    this.statusText.setText('过关！');
    this.statusText.setColor('#00ff00');

    // 短暂延迟后进入下一关
    this.time.delayedCall(300, () => {
      this.statusText.setText('');
      this.createTargetArea();
      this.startLevelTimer();
    });
  }

  onGameWon() {
    this.gameWon = true;
    const totalSeconds = (this.totalTime / 1000).toFixed(2);
    
    this.statusText.setText(`恭喜通关！\n总用时: ${totalSeconds}秒\n点击重新开始`);
    this.statusText.setColor('#ffff00');
    this.statusText.setFontSize('28px');

    // 禁用目标区域
    if (this.targetZone) {
      this.targetZone.disableInteractive();
    }

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 更新剩余时间显示
    if (this.levelTimer) {
      this.remainingTime = Math.max(0, 1000 - (time - this.levelStartTime));
      const remainingSeconds = (this.remainingTime / 1000).toFixed(2);
      this.timeText.setText(`剩余时间: ${remainingSeconds}s`);

      // 时间不足时变红
      if (this.remainingTime < 300) {
        this.timeText.setColor('#ff0000');
      } else {
        this.timeText.setColor('#00ff00');
      }
    }

    // 更新总用时显示
    const currentTotal = this.totalTime + (time - this.levelStartTime);
    const totalSeconds = (currentTotal / 1000).toFixed(2);
    this.totalTimeText.setText(`总用时: ${totalSeconds}s`);
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

// 暴露状态变量用于验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    totalLevels: scene.totalLevels,
    totalTime: scene.totalTime,
    remainingTime: scene.remainingTime,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon
  };
};