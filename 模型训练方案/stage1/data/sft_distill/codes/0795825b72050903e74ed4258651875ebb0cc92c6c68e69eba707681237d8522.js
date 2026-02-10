// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, WinScene, LoseScene]
};

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.levelTimeLimit = 1000; // 1秒 = 1000毫秒
    this.timer = null;
    this.isLevelActive = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 重置游戏状态（用于重新开始）
    if (this.scene.settings.data && this.scene.settings.data.restart) {
      this.currentLevel = 1;
      this.totalTime = 0;
    }

    this.levelStartTime = this.time.now;
    this.isLevelActive = true;

    // 创建UI文本
    this.levelText = this.add.text(400, 50, `关卡: ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '剩余时间: 1.00s', {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.totalTimeText = this.add.text(400, 150, `总用时: ${(this.totalTime / 1000).toFixed(2)}s`, {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.instructionText = this.add.text(400, 250, '点击目标通关！', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建目标区域（使用 Graphics）
    this.createTarget();

    // 创建倒计时器
    this.timer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onTimeOut,
      callbackScope: this,
      loop: false
    });

    // 状态信号（用于验证）
    this.registry.set('currentLevel', this.currentLevel);
    this.registry.set('totalTime', this.totalTime);
    this.registry.set('isLevelActive', this.isLevelActive);
  }

  createTarget() {
    // 使用固定位置确保行为确定性
    const positions = [
      { x: 400, y: 350 },
      { x: 300, y: 400 },
      { x: 500, y: 400 },
      { x: 350, y: 450 },
      { x: 450, y: 450 },
      { x: 400, y: 500 },
      { x: 250, y: 350 },
      { x: 550, y: 350 }
    ];

    const pos = positions[this.currentLevel - 1];
    
    // 绘制目标
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0xff0000, 1);
    this.targetGraphics.fillCircle(pos.x, pos.y, 40);
    
    // 添加边框
    this.targetGraphics.lineStyle(4, 0xffffff, 1);
    this.targetGraphics.strokeCircle(pos.x, pos.y, 40);

    // 添加交互区域
    const hitArea = new Phaser.Geom.Circle(pos.x, pos.y, 40);
    this.targetGraphics.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    // 点击事件
    this.targetGraphics.on('pointerdown', () => {
      if (this.isLevelActive) {
        this.onTargetClicked();
      }
    });

    // 鼠标悬停效果
    this.targetGraphics.on('pointerover', () => {
      if (this.isLevelActive) {
        this.targetGraphics.clear();
        this.targetGraphics.fillStyle(0xff6600, 1);
        this.targetGraphics.fillCircle(pos.x, pos.y, 40);
        this.targetGraphics.lineStyle(4, 0xffffff, 1);
        this.targetGraphics.strokeCircle(pos.x, pos.y, 40);
      }
    });

    this.targetGraphics.on('pointerout', () => {
      if (this.isLevelActive) {
        this.targetGraphics.clear();
        this.targetGraphics.fillStyle(0xff0000, 1);
        this.targetGraphics.fillCircle(pos.x, pos.y, 40);
        this.targetGraphics.lineStyle(4, 0xffffff, 1);
        this.targetGraphics.strokeCircle(pos.x, pos.y, 40);
      }
    });
  }

  onTargetClicked() {
    this.isLevelActive = false;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 移除计时器
    if (this.timer) {
      this.timer.remove();
    }

    // 成功反馈
    this.targetGraphics.clear();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    const pos = this.targetGraphics.x || 400;
    this.targetGraphics.fillCircle(
      this.currentLevel === 1 ? 400 : 
      this.currentLevel === 2 ? 300 :
      this.currentLevel === 3 ? 500 :
      this.currentLevel === 4 ? 350 :
      this.currentLevel === 5 ? 450 :
      this.currentLevel === 6 ? 400 :
      this.currentLevel === 7 ? 250 : 550,
      this.currentLevel === 1 ? 350 :
      this.currentLevel === 2 ? 400 :
      this.currentLevel === 3 ? 400 :
      this.currentLevel === 4 ? 450 :
      this.currentLevel === 5 ? 450 :
      this.currentLevel === 6 ? 500 :
      this.currentLevel === 7 ? 350 : 350,
      40
    );

    // 检查是否通关
    if (this.currentLevel >= this.maxLevel) {
      this.time.delayedCall(300, () => {
        this.scene.start('WinScene', { totalTime: this.totalTime });
      });
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.scene.restart();
      });
    }

    // 更新状态信号
    this.registry.set('currentLevel', this.currentLevel);
    this.registry.set('totalTime', this.totalTime);
  }

  onTimeOut() {
    if (!this.isLevelActive) return;

    this.isLevelActive = false;
    
    // 失败，进入失败场景
    this.scene.start('LoseScene', { 
      level: this.currentLevel,
      totalTime: this.totalTime
    });
  }

  update() {
    if (this.isLevelActive && this.timer) {
      // 更新倒计时显示
      const remaining = this.levelTimeLimit - this.timer.getElapsed();
      const remainingSeconds = Math.max(0, remaining / 1000);
      this.timerText.setText(`剩余时间: ${remainingSeconds.toFixed(2)}s`);

      // 时间紧张时变红
      if (remainingSeconds < 0.3) {
        this.timerText.setColor('#ff0000');
      } else if (remainingSeconds < 0.5) {
        this.timerText.setColor('#ff6600');
      } else {
        this.timerText.setColor('#ffff00');
      }

      // 更新总用时显示
      const currentTotal = this.totalTime + (this.time.now - this.levelStartTime);
      this.totalTimeText.setText(`总用时: ${(currentTotal / 1000).toFixed(2)}s`);
    }
  }
}

// 胜利场景
class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  preload() {}

  create(data) {
    const totalTime = data.totalTime || 0;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x004400, 1);
    bg.fillRect(0, 0, 800, 600);

    // 胜利文本
    this.add.text(400, 200, '恭喜通关！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 总用时
    this.add.text(400, 280, `总用时: ${(totalTime / 1000).toFixed(2)} 秒`, {
      fontSize: '36px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 评价
    let rating = '';
    const seconds = totalTime / 1000;
    if (seconds < 4) {
      rating = '神速！S 级';
    } else if (seconds < 5) {
      rating = '优秀！A 级';
    } else if (seconds < 6) {
      rating = '良好！B 级';
    } else {
      rating = '通过！C 级';
    }

    this.add.text(400, 350, rating, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重新开始按钮
    const restartButton = this.add.graphics();
    restartButton.fillStyle(0x0066ff, 1);
    restartButton.fillRoundedRect(300, 450, 200, 60, 10);
    restartButton.lineStyle(3, 0xffffff, 1);
    restartButton.strokeRoundedRect(300, 450, 200, 60, 10);
    restartButton.setInteractive(
      new Phaser.Geom.Rectangle(300, 450, 200, 60),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(400, 480, '重新开始', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene', { restart: true });
    });

    // 状态信号
    this.registry.set('gameState', 'win');
    this.registry.set('finalTime', totalTime);
  }
}

// 失败场景
class LoseScene extends Phaser.Scene {
  constructor() {
    super('LoseScene');
  }

  preload() {}

  create(data) {
    const level = data.level || 1;
    const totalTime = data.totalTime || 0;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x440000, 1);
    bg.fillRect(0, 0, 800, 600);

    // 失败文本
    this.add.text(400, 200, '挑战失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 失败关卡
    this.add.text(400, 280, `失败于第 ${level} 关`, {
      fontSize: '32px',
      color: '#ffaa00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 提示
    this.add.text(400, 340, '超时了！请在1秒内点击目标', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重试按钮
    const retryButton = this.add.graphics();
    retryButton.fillStyle(0xff6600, 1);
    retryButton.fillRoundedRect(300, 420, 200, 60, 10);
    retryButton.lineStyle(3, 0xffffff, 1);
    retryButton.strokeRoundedRect(300, 420, 200, 60, 10);
    retryButton.setInteractive(
      new Phaser.Geom.Rectangle(300, 420, 200, 60),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(400, 450, '重试', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    retryButton.on('pointerdown', () => {
      this.scene.start('GameScene', { restart: true });
    });

    // 状态信号
    this.registry.set('gameState', 'lose');
    this.registry.set('failedLevel', level);
  }
}

// 启动游戏
new Phaser.Game(config);