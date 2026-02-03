class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0;
    this.maxProgress = 20;
    this.barWidth = 400;
    this.barHeight = 40;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      progress: 0,
      completed: false,
      timestamp: Date.now()
    };

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建标题文字
    this.titleText = this.add.text(centerX, centerY - 80, 'Progress Bar Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.titleText.setOrigin(0.5);

    // 创建进度文字
    this.progressText = this.add.text(centerX, centerY - 40, '0 / 20', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);

    // 创建进度条背景（灰色边框）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(
      centerX - this.barWidth / 2,
      centerY,
      this.barWidth,
      this.barHeight
    );

    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0xffffff, 1);
    this.barBorder.strokeRect(
      centerX - this.barWidth / 2,
      centerY,
      this.barWidth,
      this.barHeight
    );

    // 创建进度条前景（红色）
    this.barForeground = this.add.graphics();

    // 创建完成文字（初始隐藏）
    this.completedText = this.add.text(centerX, centerY + 80, 'COMPLETED!', {
      fontSize: '36px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completedText.setOrigin(0.5);
    this.completedText.setVisible(false);

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.incrementProgress,
      callbackScope: this,
      loop: true
    });

    // 初始绘制进度条
    this.updateProgressBar();

    console.log(JSON.stringify({
      event: 'progress_bar_initialized',
      progress: this.progress,
      maxProgress: this.maxProgress,
      timestamp: Date.now()
    }));
  }

  incrementProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.updateProgressBar();

      // 更新验证信号
      window.__signals__.progress = this.progress;
      window.__signals__.timestamp = Date.now();

      console.log(JSON.stringify({
        event: 'progress_updated',
        progress: this.progress,
        maxProgress: this.maxProgress,
        percentage: (this.progress / this.maxProgress * 100).toFixed(1),
        timestamp: Date.now()
      }));

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  updateProgressBar() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 计算当前进度宽度
    const progressWidth = (this.progress / this.maxProgress) * this.barWidth;

    // 清除并重绘进度条前景
    this.barForeground.clear();
    this.barForeground.fillStyle(0xff0000, 1); // 红色
    this.barForeground.fillRect(
      centerX - this.barWidth / 2,
      centerY,
      progressWidth,
      this.barHeight
    );

    // 更新进度文字
    this.progressText.setText(`${this.progress} / ${this.maxProgress}`);
  }

  onComplete() {
    // 停止定时器
    if (this.progressTimer) {
      this.progressTimer.destroy();
      this.progressTimer = null;
    }

    // 显示完成文字
    this.completedText.setVisible(true);

    // 添加闪烁动画
    this.tweens.add({
      targets: this.completedText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 更新验证信号
    window.__signals__.completed = true;
    window.__signals__.timestamp = Date.now();

    console.log(JSON.stringify({
      event: 'progress_completed',
      progress: this.progress,
      maxProgress: this.maxProgress,
      completed: true,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可选：在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ProgressBarScene
};

new Phaser.Game(config);