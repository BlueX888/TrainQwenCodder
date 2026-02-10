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
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条配置
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;
    
    // 创建进度条背景（灰色）
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x666666, 1);
    this.barBackground.fillRect(barX, barY, barWidth, barHeight);
    
    // 创建进度条边框
    this.barBorder = this.add.graphics();
    this.barBorder.lineStyle(3, 0x333333, 1);
    this.barBorder.strokeRect(barX, barY, barWidth, barHeight);
    
    // 创建进度条前景（黄色）
    this.barForeground = this.add.graphics();
    
    // 进度文本
    this.progressText = this.add.text(centerX, centerY, '0 / 3', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.progressText.setOrigin(0.5);
    
    // 标题文本
    this.titleText = this.add.text(centerX, centerY - 60, 'Loading Progress', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    this.titleText.setOrigin(0.5);
    
    // 完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 60, 'COMPLETE!', {
      fontSize: '36px',
      color: '#00ff00',
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
      
      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  onComplete() {
    this.isComplete = true;
    
    // 停止定时器
    if (this.progressTimer) {
      this.progressTimer.remove();
    }
    
    // 显示完成文本
    this.completeText.setVisible(true);
    
    // 添加完成文本的闪烁效果
    this.tweens.add({
      targets: this.completeText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    console.log('Progress complete! Final progress:', this.progress);
  }

  drawProgressBar() {
    // 清除之前的前景
    this.barForeground.clear();
    
    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = this.barConfig.width * progressRatio;
    
    // 绘制黄色进度条
    this.barForeground.fillStyle(0xffff00, 1);
    this.barForeground.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      currentWidth,
      this.barConfig.height
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

const game = new Phaser.Game(config);