class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 3;
    this.isCompleted = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条参数
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;

    // 创建进度条背景（灰色）
    this.backgroundBar = this.add.graphics();
    this.backgroundBar.fillStyle(0x333333, 1);
    this.backgroundBar.fillRect(barX, barY, barWidth, barHeight);

    // 创建进度条边框
    this.borderGraphics = this.add.graphics();
    this.borderGraphics.lineStyle(3, 0xffffff, 1);
    this.borderGraphics.strokeRect(barX, barY, barWidth, barHeight);

    // 创建进度条前景（粉色）
    this.progressBar = this.add.graphics();

    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY, '0 / 3', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成提示文本（初始隐藏）
    this.completedText = this.add.text(centerX, centerY + 60, '完成！', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff69b4',
      fontStyle: 'bold'
    });
    this.completedText.setOrigin(0.5);
    this.completedText.setVisible(false);

    // 创建标题文本
    this.titleText = this.add.text(centerX, centerY - 80, '进度条演示', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.titleText.setOrigin(0.5);

    // 存储进度条参数供 update 使用
    this.barParams = { barX, barY, barWidth, barHeight };

    // 初始化进度条显示
    this.updateProgressBar();

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.increaseProgress,
      callbackScope: this,
      loop: true
    });
  }

  increaseProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.updateProgressBar();

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  updateProgressBar() {
    const { barX, barY, barWidth, barHeight } = this.barParams;
    
    // 清除之前的进度条
    this.progressBar.clear();

    // 计算当前进度条宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = barWidth * progressRatio;

    // 绘制粉色进度条
    this.progressBar.fillStyle(0xff69b4, 1); // 粉色
    this.progressBar.fillRect(barX, barY, currentWidth, barHeight);

    // 更新文本
    this.progressText.setText(`${this.progress} / ${this.maxProgress}`);
  }

  onComplete() {
    // 停止计时器
    if (this.progressTimer) {
      this.progressTimer.remove();
      this.progressTimer = null;
    }

    // 显示完成文本
    this.completedText.setVisible(true);
    this.isCompleted = true;

    // 添加完成动画效果
    this.tweens.add({
      targets: this.completedText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 300,
      repeat: 2
    });

    console.log('Progress completed! Final progress:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中主要逻辑在定时器回调中处理
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ProgressBarScene
};

// 创建游戏实例
new Phaser.Game(config);