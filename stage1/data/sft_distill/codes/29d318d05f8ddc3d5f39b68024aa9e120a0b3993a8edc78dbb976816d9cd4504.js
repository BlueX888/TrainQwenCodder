class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 3;
    this.isComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const barWidth = 300;
    const barHeight = 40;

    // 创建进度条背景（灰色）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0x666666, 1);
    this.barBorder.strokeRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条前景（黄色）
    this.barForeground = this.add.graphics();
    
    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY, '0/3', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 80, '完成！', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);

    // 存储进度条参数供 update 使用
    this.barParams = {
      x: centerX - barWidth / 2,
      y: centerY - barHeight / 2,
      width: barWidth,
      height: barHeight
    };

    // 创建计时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.incrementProgress,
      callbackScope: this,
      repeat: this.maxProgress - 1, // 重复2次（0->1, 1->2, 2->3）
      startAt: 0
    });

    // 初始绘制进度条
    this.updateProgressBar();

    // 添加调试信息
    this.debugText = this.add.text(10, 10, 'Progress: 0/3', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
  }

  incrementProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.updateProgressBar();
      
      // 更新进度文本
      this.progressText.setText(`${this.progress}/${this.maxProgress}`);
      
      // 更新调试文本
      this.debugText.setText(`Progress: ${this.progress}/${this.maxProgress}`);
      
      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  updateProgressBar() {
    // 清除之前的绘制
    this.barForeground.clear();
    
    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barParams.width * progressRatio;
    
    // 绘制黄色进度条
    this.barForeground.fillStyle(0xffcc00, 1);
    this.barForeground.fillRect(
      this.barParams.x,
      this.barParams.y,
      currentWidth,
      this.barParams.height
    );
  }

  onComplete() {
    this.isComplete = true;
    
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
    
    // 更新调试文本
    this.debugText.setText(`Progress: ${this.progress}/${this.maxProgress} - COMPLETE!`);
    
    console.log('Progress bar complete!', {
      progress: this.progress,
      isComplete: this.isComplete
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中，进度更新由 TimerEvent 驱动
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ProgressBarScene
};

new Phaser.Game(config);