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
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 说明
    const info = this.add.text(width / 2, height / 2, 
      '共3关，每关限时2秒\n点击绿色目标区域通关\n超时则失败', {
      fontSize: '24px',
      color: '#aaaaaa',
      align: 'center'
    });
    info.setOrigin(0.5);
    
    // 开始按钮
    const startButton = this.add.graphics();
    startButton.fillStyle(0x16c79a, 1);
    startButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    
    const startText = this.add.text(width / 2, height * 2 / 3 + 30, '开始游戏', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    startText.setOrigin(0.5);
    
    // 点击开始
    const buttonZone = this.add.zone(width / 2, height * 2 / 3 + 30, 200, 60);
    buttonZone.setInteractive();
    buttonZone.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    // 初始化游戏状态
    this.currentLevel = 1;
    this.maxLevel = 3;
    this.levelTimeLimit = 2000; // 2秒
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.isLevelActive = false;
    this.levelTimer = null;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    this.bg = this.add.graphics();
    this.bg.fillStyle(0x0f3460, 1);
    this.bg.fillRect(0, 0, width, height);
    
    // UI文本
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    this.timerText = this.add.text(width - 20, 20, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.timerText.setOrigin(1, 0);
    
    this.totalTimeText = this.add.text(20, 60, '', {
      fontSize: '20px',
      color: '#aaaaaa'
    });
    
    // 提示文本
    this.hintText = this.add.text(width / 2, height / 2 - 100, '', {
      fontSize: '28px',
      color: '#ffffff',
      align: 'center'
    });
    this.hintText.setOrigin(0.5);
    
    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    const { width, height } = this.cameras.main;
    
    this.isLevelActive = true;
    this.levelStartTime = this.time.now;
    
    // 更新关卡显示
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.hintText.setText(`第 ${this.currentLevel} 关\n点击绿色区域通关！`);
    
    // 清除旧的目标区域
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetZone) {
      this.targetZone.destroy();
    }
    
    // 创建目标区域（随机位置，但确保在屏幕内）
    const targetSize = 150;
    const padding = 100;
    const targetX = Phaser.Math.Between(padding + targetSize / 2, width - padding - targetSize / 2);
    const targetY = Phaser.Math.Between(height / 2, height - padding - targetSize / 2);
    
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x16c79a, 1);
    this.targetGraphics.fillCircle(targetX, targetY, targetSize / 2);
    
    // 添加目标文字
    const targetText = this.add.text(targetX, targetY, 'CLICK', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    targetText.setOrigin(0.5);
    
    // 创建可点击区域
    this.targetZone = this.add.zone(targetX, targetY, targetSize, targetSize);
    this.targetZone.setInteractive();
    this.targetZone.once('pointerdown', () => {
      this.onLevelComplete();
    });
    
    // 设置关卡计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }
    
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this
    });
  }

  onLevelComplete() {
    if (!this.isLevelActive) return;
    
    this.isLevelActive = false;
    
    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;
    
    // 移除计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
      this.levelTimer = null;
    }
    
    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    if (this.targetZone) {
      this.targetZone.destroy();
    }
    
    // 检查是否完成所有关卡
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.time.delayedCall(500, () => {
        this.scene.start('EndScene', {
          success: true,
          totalTime: this.totalTime,
          maxLevel: this.maxLevel
        });
      });
    } else {
      // 进入下一关
      this.currentLevel++;
      this.hintText.setText('通过！');
      
      this.time.delayedCall(800, () => {
        this.startLevel();
      });
    }
  }

  onLevelTimeout() {
    if (!this.isLevelActive) return;
    
    this.isLevelActive = false;
    
    // 游戏失败
    this.hintText.setText('超时！游戏失败');
    this.hintText.setColor('#ff0000');
    
    this.time.delayedCall(1500, () => {
      this.scene.start('EndScene', {
        success: false,
        currentLevel: this.currentLevel,
        maxLevel: this.maxLevel
      });
    });
  }

  update() {
    if (this.isLevelActive && this.levelTimer) {
      // 更新倒计时显示
      const remaining = this.levelTimeLimit - this.levelTimer.getElapsed();
      const seconds = Math.max(0, remaining / 1000).toFixed(2);
      this.timerText.setText(`剩余: ${seconds}s`);
      
      // 根据剩余时间改变颜色
      if (remaining < 500) {
        this.timerText.setColor('#ff0000');
      } else if (remaining < 1000) {
        this.timerText.setColor('#ffaa00');
      } else {
        this.timerText.setColor('#ffffff');
      }
    }
    
    // 更新总用时
    if (this.isLevelActive) {
      const currentTotal = this.totalTime + (this.time.now - this.levelStartTime);
      this.totalTimeText.setText(`总用时: ${(currentTotal / 1000).toFixed(2)}s`);
    }
  }
}

// 结束场景
class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  init(data) {
    this.success = data.success || false;
    this.totalTime = data.totalTime || 0;
    this.currentLevel = data.currentLevel || 0;
    this.maxLevel = data.maxLevel || 3;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    if (this.success) {
      bg.fillStyle(0x1a5f3a, 1);
    } else {
      bg.fillStyle(0x5f1a1a, 1);
    }
    bg.fillRect(0, 0, width, height);
    
    // 结果标题
    const resultTitle = this.add.text(width / 2, height / 3, 
      this.success ? '🎉 通关成功！' : '💥 挑战失败', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    resultTitle.setOrigin(0.5);
    
    // 详细信息
    let infoText = '';
    if (this.success) {
      infoText = `完成关卡: ${this.maxLevel}/${this.maxLevel}\n总用时: ${(this.totalTime / 1000).toFixed(2)} 秒`;
    } else {
      infoText = `失败于第 ${this.currentLevel} 关\n已完成: ${this.currentLevel - 1}/${this.maxLevel} 关`;
    }
    
    const info = this.add.text(width / 2, height / 2, infoText, {
      fontSize: '28px',
      color: '#ffffff',
      align: 'center'
    });
    info.setOrigin(0.5);
    
    // 重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x16c79a, 1);
    restartButton.fillRoundedRect(width / 2 - 100, height * 2 / 3, 200, 60, 10);
    
    const restartText = this.add.text(width / 2, height * 2 / 3 + 30, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);
    
    const buttonZone = this.add.zone(width / 2, height * 2 / 3 + 30, 200, 60);
    buttonZone.setInteractive();
    buttonZone.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 显示可验证状态
    console.log('Game End State:', {
      success: this.success,
      totalTime: this.totalTime,
      currentLevel: this.currentLevel,
      maxLevel: this.maxLevel
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