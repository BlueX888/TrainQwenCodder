class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 15;
    this.isComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条尺寸
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

    // 创建进度条前景（红色）
    this.progressBar = this.add.graphics();
    
    // 创建进度文本
    this.progressText = this.add.text(centerX, barY - 30, '0/15', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, barY + barHeight + 50, '完成！', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);

    // 存储进度条参数供 update 使用
    this.barConfig = {
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight
    };

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
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
      
      // 更新进度文本
      this.progressText.setText(`${this.progress}/${this.maxProgress}`);

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  updateProgressBar() {
    // 清除之前的进度条
    this.progressBar.clear();
    
    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;

    // 绘制红色进度条
    if (currentWidth > 0) {
      this.progressBar.fillStyle(0xff0000, 1);
      this.progressBar.fillRect(
        this.barConfig.x,
        this.barConfig.y,
        currentWidth,
        this.barConfig.height
      );
    }
  }

  onComplete() {
    // 停止计时器
    if (this.progressTimer) {
      this.progressTimer.remove();
      this.progressTimer = null;
    }

    // 设置完成状态
    this.isComplete = true;

    // 显示完成文本
    this.completeText.setVisible(true);

    // 添加完成文本的缩放动画
    this.tweens.add({
      targets: this.completeText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 进度条变为绿色
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      this.barConfig.width,
      this.barConfig.height
    );

    console.log('Progress complete! Final value:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中主要逻辑在 incrementProgress 中处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ProgressBarScene
};

// 创建游戏实例
const game = new Phaser.Game(config);