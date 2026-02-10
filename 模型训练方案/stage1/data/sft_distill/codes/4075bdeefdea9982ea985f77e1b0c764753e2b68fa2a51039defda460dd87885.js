class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 3;
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
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillStyle(0x333333, 1);
    this.bgGraphics.fillRect(barX, barY, barWidth, barHeight);

    // 创建进度条边框
    this.bgGraphics.lineStyle(2, 0x666666, 1);
    this.bgGraphics.strokeRect(barX, barY, barWidth, barHeight);

    // 创建进度条前景（绿色）
    this.progressGraphics = this.add.graphics();
    
    // 存储进度条位置信息
    this.barConfig = {
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight
    };

    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY, '0 / 3', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5, 0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 60, 'Complete!', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5, 0.5);
    this.completeText.setVisible(false);

    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.updateProgress,
      callbackScope: this,
      repeat: this.maxProgress // 重复3次（0->1, 1->2, 2->3）
    });

    // 初始绘制进度条
    this.drawProgressBar();
  }

  updateProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.progressText.setText(`${this.progress} / ${this.maxProgress}`);
      
      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.isComplete = true;
        this.completeText.setVisible(true);
        
        // 添加完成动画效果
        this.tweens.add({
          targets: this.completeText,
          scaleX: 1.2,
          scaleY: 1.2,
          yoyo: true,
          duration: 300,
          repeat: 2
        });
      }
    }
  }

  drawProgressBar() {
    // 清除之前的绘制
    this.progressGraphics.clear();
    
    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;
    
    // 绘制绿色进度条
    if (currentWidth > 0) {
      this.progressGraphics.fillStyle(0x00ff00, 1);
      this.progressGraphics.fillRect(
        this.barConfig.x,
        this.barConfig.y,
        currentWidth,
        this.barConfig.height
      );
    }
  }

  update(time, delta) {
    // 每帧更新进度条显示
    this.drawProgressBar();
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