class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0;
    this.maxProgress = 20;
    this.isCompleted = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      progress: 0,
      maxProgress: 20,
      isCompleted: false,
      events: []
    };

    // 进度条配置
    const barWidth = 600;
    const barHeight = 40;
    const barX = 100;
    const barY = 280;

    // 创建标题文字
    this.add.text(400, 200, '进度条演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建进度条背景（灰色）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(barX, barY, barWidth, barHeight);

    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0xffffff, 1);
    this.barBorder.strokeRect(barX, barY, barWidth, barHeight);

    // 创建进度条前景（红色）
    this.barForeground = this.add.graphics();
    
    // 创建进度文字
    this.progressText = this.add.text(400, 300, '0 / 20', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建完成文字（初始隐藏）
    this.completedText = this.add.text(400, 380, '✓ 完成！', {
      fontSize: '36px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 存储进度条参数供后续使用
    this.barConfig = { x: barX, y: barY, width: barWidth, height: barHeight };

    // 创建定时器，每秒增加1点进度
    this.progressTimer = this.time.addEvent({
      delay: 1000,
      callback: this.incrementProgress,
      callbackScope: this,
      loop: true
    });

    // 记录初始事件
    this.logEvent('游戏开始', { progress: 0 });

    // 初始绘制进度条
    this.updateProgressBar();
  }

  incrementProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      
      // 更新 signals
      window.__signals__.progress = this.progress;
      
      // 记录事件
      this.logEvent('进度增加', { progress: this.progress });

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onProgressComplete();
      }
    }
  }

  updateProgressBar() {
    // 清除之前的前景
    this.barForeground.clear();

    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;

    // 绘制红色进度条
    if (currentWidth > 0) {
      this.barForeground.fillStyle(0xff0000, 1);
      this.barForeground.fillRect(
        this.barConfig.x,
        this.barConfig.y,
        currentWidth,
        this.barConfig.height
      );
    }

    // 更新进度文字
    this.progressText.setText(`${this.progress} / ${this.maxProgress}`);
  }

  onProgressComplete() {
    this.isCompleted = true;
    
    // 更新 signals
    window.__signals__.isCompleted = true;
    
    // 停止定时器
    if (this.progressTimer) {
      this.progressTimer.remove();
    }

    // 显示完成文字
    this.completedText.setVisible(true);

    // 添加完成动画效果
    this.tweens.add({
      targets: this.completedText,
      scale: { from: 0.5, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: 2
    });

    // 记录完成事件
    this.logEvent('进度完成', { progress: this.progress, completed: true });

    // 输出完成日志
    console.log('Progress completed!', JSON.stringify(window.__signals__));
  }

  logEvent(eventName, data) {
    const event = {
      timestamp: Date.now(),
      name: eventName,
      data: data
    };
    window.__signals__.events.push(event);
    console.log(`[Event] ${eventName}:`, JSON.stringify(data));
  }

  update(time, delta) {
    // 每帧更新进度条显示
    this.updateProgressBar();
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ProgressBarScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);