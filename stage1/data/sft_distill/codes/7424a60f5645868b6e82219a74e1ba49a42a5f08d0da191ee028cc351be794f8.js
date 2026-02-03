class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 15;
    this.isCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条尺寸
    this.barWidth = 400;
    this.barHeight = 40;
    this.barX = centerX - this.barWidth / 2;
    this.barY = centerY - this.barHeight / 2;

    // 创建背景图形对象（灰色边框和背景）
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.lineStyle(2, 0x333333, 1);
    this.bgGraphics.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
    this.bgGraphics.fillStyle(0x555555, 1);
    this.bgGraphics.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);

    // 创建进度条前景图形对象（紫色）
    this.progressGraphics = this.add.graphics();

    // 显示进度文字
    this.progressText = this.add.text(centerX, this.barY - 30, '进度: 0 / 15', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5, 0.5);

    // 完成文字（初始隐藏）
    this.completeText = this.add.text(centerX, this.barY + this.barHeight + 50, '完成！', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5, 0.5);
    this.completeText.setVisible(false);

    // 创建定时器事件，每秒增加进度
    this.timerEvent = this.time.addEvent({
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
      this.progressText.setText(`进度: ${this.progress} / ${this.maxProgress}`);
      
      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  onComplete() {
    this.isCompleted = true;
    this.completeText.setVisible(true);
    
    // 停止定时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    // 添加完成文字的闪烁效果
    this.tweens.add({
      targets: this.completeText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  drawProgressBar() {
    // 清除之前的进度条
    this.progressGraphics.clear();

    // 计算当前进度宽度
    const progressWidth = (this.progress / this.maxProgress) * this.barWidth;

    // 绘制紫色进度条
    this.progressGraphics.fillStyle(0x9966ff, 1); // 紫色
    this.progressGraphics.fillRect(this.barX, this.barY, progressWidth, this.barHeight);
  }

  update(time, delta) {
    // 每帧重绘进度条以反映最新进度
    this.drawProgressBar();
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