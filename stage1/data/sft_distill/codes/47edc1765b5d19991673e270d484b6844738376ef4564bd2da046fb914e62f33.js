class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0;
    this.maxProgress = 5;
    this.isCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化signals用于验证
    window.__signals__ = {
      progress: 0,
      isCompleted: false,
      updates: []
    };

    // 进度条配置
    const barWidth = 400;
    const barHeight = 40;
    const barX = 200;
    const barY = 280;

    // 创建进度条背景（深灰色）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(barX, barY, barWidth, barHeight);

    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0xffffff, 1);
    this.barBorder.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // 创建进度条前景（青色）
    this.barForeground = this.add.graphics();

    // 创建进度文本
    this.progressText = this.add.text(400, 250, 'Progress: 0 / 5', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);

    // 创建完成文本（初始隐藏）
    this.completedText = this.add.text(400, 350, 'COMPLETED!', {
      fontSize: '32px',
      color: '#00ffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completedText.setOrigin(0.5);
    this.completedText.setVisible(false);

    // 存储进度条参数供update使用
    this.barConfig = {
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight
    };

    // 创建定时器事件，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.incrementProgress,
      callbackScope: this,
      loop: true
    });

    // 初始绘制进度条
    this.updateProgressBar();

    console.log(JSON.stringify({
      event: 'game_start',
      progress: this.progress,
      maxProgress: this.maxProgress
    }));
  }

  incrementProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      
      // 更新signals
      window.__signals__.progress = this.progress;
      window.__signals__.updates.push({
        timestamp: Date.now(),
        progress: this.progress
      });

      // 更新进度文本
      this.progressText.setText(`Progress: ${this.progress} / ${this.maxProgress}`);

      console.log(JSON.stringify({
        event: 'progress_update',
        progress: this.progress,
        maxProgress: this.maxProgress
      }));

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  onComplete() {
    this.isCompleted = true;
    window.__signals__.isCompleted = true;

    // 停止定时器
    if (this.progressTimer) {
      this.progressTimer.remove();
    }

    // 显示完成文本
    this.completedText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.completedText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log(JSON.stringify({
      event: 'progress_completed',
      progress: this.progress,
      maxProgress: this.maxProgress,
      isCompleted: true
    }));
  }

  updateProgressBar() {
    // 清除之前的绘制
    this.barForeground.clear();

    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;

    // 绘制青色进度条
    this.barForeground.fillStyle(0x00ffff, 1);
    this.barForeground.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      currentWidth,
      this.barConfig.height
    );
  }

  update(time, delta) {
    // 每帧更新进度条显示
    this.updateProgressBar();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ProgressBarScene
};

const game = new Phaser.Game(config);