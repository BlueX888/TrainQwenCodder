class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 5;
    this.barWidth = 400;
    this.barHeight = 40;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 创建进度条背景（灰色）
    this.bgBar = this.add.graphics();
    this.bgBar.fillStyle(0x333333, 1);
    this.bgBar.fillRect(
      centerX - this.barWidth / 2,
      centerY - this.barHeight / 2,
      this.barWidth,
      this.barHeight
    );

    // 创建进度条前景（紫色）
    this.progressBar = this.add.graphics();

    // 创建进度文本
    this.progressText = this.add.text(
      centerX,
      centerY,
      `${this.progress} / ${this.maxProgress}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.progressText.setOrigin(0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(
      centerX,
      centerY + 60,
      '完成！',
      {
        fontSize: '32px',
        color: '#00ff00',
        fontStyle: 'bold'
      }
    );
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);

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
      this.progressText.setText(`${this.progress} / ${this.maxProgress}`);
      
      // 当进度达到最大值时
      if (this.progress >= this.maxProgress) {
        this.progressTimer.remove(); // 停止计时器
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
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 清除之前的绘制
    this.progressBar.clear();
    
    // 计算当前进度条宽度
    const currentWidth = (this.progress / this.maxProgress) * this.barWidth;
    
    // 绘制紫色进度条
    this.progressBar.fillStyle(0x9966ff, 1);
    this.progressBar.fillRect(
      centerX - this.barWidth / 2,
      centerY - this.barHeight / 2,
      currentWidth,
      this.barHeight
    );
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