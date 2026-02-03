class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.totalTime = 0;
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.isGameOver = false;
    this.target = null;
    this.levelText = null;
    this.timerText = null;
    this.statusText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(400, 50, `关卡: ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 100, '剩余时间: 1.00s', {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.statusText = this.add.text(400, 150, '点击目标通关！', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    const totalTimeText = this.add.text(400, 550, '总用时: 0.00s', {
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);
    this.totalTimeText = totalTimeText;

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.isGameOver) return;

    // 清除旧目标
    if (this.target) {
      this.target.destroy();
    }

    // 清除旧计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 更新关卡显示
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.statusText.setText('点击目标通关！');
    this.statusText.setColor('#ffff00');

    // 创建目标（随机位置的圆形）
    const x = Phaser.Math.Between(150, 650);
    const y = Phaser.Math.Between(250, 450);
    const radius = 40 - (this.currentLevel - 1) * 5; // 关卡越高，目标越小

    this.target = this.add.graphics();
    this.target.fillStyle(0xff0000, 1);
    this.target.fillCircle(x, y, radius);
    this.target.lineStyle(3, 0xffffff, 1);
    this.target.strokeCircle(x, y, radius);

    // 设置交互区域
    this.target.setInteractive(
      new Phaser.Geom.Circle(x, y, radius),
      Phaser.Geom.Circle.Contains
    );

    // 点击事件
    this.target.once('pointerdown', () => {
      this.onTargetHit();
    });

    // 鼠标悬停效果
    this.target.on('pointerover', () => {
      this.target.clear();
      this.target.fillStyle(0xff6600, 1);
      this.target.fillCircle(x, y, radius);
      this.target.lineStyle(3, 0xffffff, 1);
      this.target.strokeCircle(x, y, radius);
    });

    this.target.on('pointerout', () => {
      this.target.clear();
      this.target.fillStyle(0xff0000, 1);
      this.target.fillCircle(x, y, radius);
      this.target.lineStyle(3, 0xffffff, 1);
      this.target.strokeCircle(x, y, radius);
    });

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建1秒倒计时
    this.levelTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onTimeout,
      callbackScope: this,
      loop: false
    });
  }

  onTargetHit() {
    if (this.isGameOver) return;

    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalTime += levelTime;

    // 更新总用时显示
    this.totalTimeText.setText(`总用时: ${(this.totalTime / 1000).toFixed(2)}s`);

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 检查是否通关
    if (this.currentLevel >= this.maxLevel) {
      this.onGameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    }
  }

  onTimeout() {
    if (this.isGameOver) return;

    this.isGameOver = true;

    // 显示失败信息
    this.statusText.setText('超时失败！');
    this.statusText.setColor('#ff0000');
    this.timerText.setText('剩余时间: 0.00s');
    this.timerText.setColor('#ff0000');

    // 禁用目标交互
    if (this.target) {
      this.target.disableInteractive();
      this.target.setAlpha(0.5);
    }

    // 显示重试按钮
    this.showRestartButton();
  }

  onGameWin() {
    this.isGameOver = true;

    // 显示胜利信息
    this.statusText.setText('恭喜通关！');
    this.statusText.setColor('#00ff00');
    this.statusText.setFontSize('32px');

    // 创建胜利特效
    const victoryBg = this.add.graphics();
    victoryBg.fillStyle(0x00ff00, 0.3);
    victoryBg.fillRect(0, 0, 800, 600);

    const winText = this.add.text(400, 300, `总用时: ${(this.totalTime / 1000).toFixed(2)}秒`, {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: winText,
      alpha: { from: 1, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 显示重试按钮
    this.time.delayedCall(1000, () => {
      this.showRestartButton();
    });
  }

  showRestartButton() {
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);

    const buttonText = this.add.text(400, 480, '重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(300, 450, 200, 60),
      Phaser.Geom.Rectangle.Contains
    );

    buttonBg.on('pointerdown', () => {
      this.scene.restart();
    });

    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x2980b9, 1);
      buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x3498db, 1);
      buttonBg.fillRoundedRect(300, 450, 200, 60, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(300, 450, 200, 60, 10);
    });
  }

  update(time, delta) {
    if (this.isGameOver || !this.levelTimer) return;

    // 更新倒计时显示
    const remaining = Math.max(0, 1000 - this.levelTimer.getElapsed());
    this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(2)}s`);

    // 根据剩余时间改变颜色
    if (remaining < 300) {
      this.timerText.setColor('#ff0000');
    } else if (remaining < 600) {
      this.timerText.setColor('#ffaa00');
    } else {
      this.timerText.setColor('#00ff00');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

new Phaser.Game(config);