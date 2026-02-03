class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 20;
    this.isCompleted = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const barWidth = 600;
    const barHeight = 50;

    // 创建进度条背景（深灰色）
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillStyle(0x333333, 1);
    this.bgGraphics.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条边框
    this.bgGraphics.lineStyle(3, 0x666666, 1);
    this.bgGraphics.strokeRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    // 创建进度条前景（白色）
    this.progressGraphics = this.add.graphics();

    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY, '0 / 20', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5, 0.5);

    // 创建标题文本
    this.titleText = this.add.text(centerX, centerY - 80, '进度加载中...', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.titleText.setOrigin(0.5, 0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
      fontSize: '36px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5, 0.5);
    this.completeText.setVisible(false);

    // 存储进度条参数供 update 使用
    this.barConfig = {
      x: centerX - barWidth / 2,
      y: centerY - barHeight / 2,
      width: barWidth,
      height: barHeight
    };

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 每秒触发一次
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
    // 清除之前的进度条
    this.progressGraphics.clear();

    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;

    // 绘制白色进度条
    this.progressGraphics.fillStyle(0xffffff, 1);
    this.progressGraphics.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      currentWidth,
      this.barConfig.height
    );
  }

  onComplete() {
    // 停止定时器
    if (this.progressTimer) {
      this.progressTimer.remove();
      this.progressTimer = null;
    }

    // 标记完成状态
    this.isCompleted = true;

    // 更新标题
    this.titleText.setText('加载完成');
    this.titleText.setColor('#00ff00');

    // 显示完成文本
    this.completeText.setVisible(true);

    // 添加完成文本的缩放动画
    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 300,
      repeat: 2
    });

    // 输出完成信息到控制台（便于验证）
    console.log('Progress completed! Final value:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖定时器回调
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