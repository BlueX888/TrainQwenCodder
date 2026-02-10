class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态变量
    this.maxProgress = 20;
    this.isCompleted = false; // 可验证的完成状态
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条尺寸
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;

    // 创建进度条背景（深灰色）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(barX, barY, barWidth, barHeight);

    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0xffffff, 1);
    this.barBorder.strokeRect(barX, barY, barWidth, barHeight);

    // 创建进度条前景（青色）
    this.barForeground = this.add.graphics();

    // 创建进度文字
    this.progressText = this.add.text(centerX, centerY, '0 / 20', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成文字（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 60, '完成！', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);

    // 存储进度条参数供更新使用
    this.barParams = { x: barX, y: barY, width: barWidth, height: barHeight };

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.updateProgress,
      callbackScope: this,
      loop: true
    });

    // 初始绘制进度条
    this.drawProgressBar();
  }

  updateProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.drawProgressBar();
      this.progressText.setText(`${this.progress} / ${this.maxProgress}`);

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  drawProgressBar() {
    // 清除之前的前景
    this.barForeground.clear();

    // 计算当前进度的宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barParams.width * progressRatio;

    // 绘制青色进度条
    this.barForeground.fillStyle(0x00ffff, 1);
    this.barForeground.fillRect(
      this.barParams.x,
      this.barParams.y,
      currentWidth,
      this.barParams.height
    );
  }

  onComplete() {
    // 停止计时器
    this.progressTimer.remove();
    this.isCompleted = true;

    // 显示完成文字
    this.completeText.setVisible(true);

    // 添加完成动画效果
    this.tweens.add({
      targets: this.completeText,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 进度条闪烁效果
    this.tweens.add({
      targets: this.barForeground,
      alpha: { from: 1, to: 0.5 },
      duration: 300,
      yoyo: true,
      repeat: 3
    });

    console.log('Progress completed! Final progress:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ProgressBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);