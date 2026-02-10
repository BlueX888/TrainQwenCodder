class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 5;
    this.isComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const barWidth = 400;
    const barHeight = 40;

    // 创建进度条背景（深灰色）
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillStyle(0x333333, 1);
    this.bgGraphics.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条边框
    this.bgGraphics.lineStyle(2, 0xffffff, 1);
    this.bgGraphics.strokeRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条前景（白色）
    this.progressGraphics = this.add.graphics();

    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY - 80, '0 / 5', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 80, '完成！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);

    // 存储进度条位置和尺寸
    this.barX = centerX - barWidth / 2;
    this.barY = centerY - barHeight / 2;
    this.barWidth = barWidth;
    this.barHeight = barHeight;

    // 创建定时器，每秒增加进度
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.incrementProgress,
      callbackScope: this,
      loop: true
    });

    // 初始绘制进度条
    this.updateProgressBar();
  }

  incrementProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.updateProgressBar();
      this.progressText.setText(`${this.progress} / ${this.maxProgress}`);

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  updateProgressBar() {
    // 清除之前的进度条
    this.progressGraphics.clear();

    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barWidth * progressRatio;

    // 绘制白色进度条
    if (currentWidth > 0) {
      this.progressGraphics.fillStyle(0xffffff, 1);
      this.progressGraphics.fillRect(
        this.barX,
        this.barY,
        currentWidth,
        this.barHeight
      );
    }
  }

  onComplete() {
    this.isComplete = true;
    
    // 停止定时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 显示完成文本
    this.completeText.setVisible(true);

    // 添加完成文本的缩放动画
    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2
    });

    // 在控制台输出完成状态（便于验证）
    console.log('Progress bar completed! Final progress:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中主要逻辑在 incrementProgress 中处理
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