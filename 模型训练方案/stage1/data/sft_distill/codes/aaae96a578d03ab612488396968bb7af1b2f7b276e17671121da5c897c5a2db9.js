class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 20;
    this.isComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 进度条配置
    this.barWidth = 400;
    this.barHeight = 40;
    this.barX = centerX - this.barWidth / 2;
    this.barY = centerY - this.barHeight / 2;
    
    // 创建背景 Graphics（边框和底色）
    this.barBackground = this.add.graphics();
    this.drawBackground();
    
    // 创建进度 Graphics（白色填充）
    this.barForeground = this.add.graphics();
    
    // 进度文本
    this.progressText = this.add.text(centerX, this.barY - 30, '进度: 0 / 20', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);
    
    // 完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, this.barY + this.barHeight + 50, '完成！', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
    
    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.increaseProgress,
      callbackScope: this,
      loop: true
    });
    
    // 初始绘制
    this.updateProgressBar();
  }

  drawBackground() {
    this.barBackground.clear();
    
    // 绘制边框
    this.barBackground.lineStyle(4, 0x666666, 1);
    this.barBackground.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
    
    // 绘制黑色背景
    this.barBackground.fillStyle(0x000000, 1);
    this.barBackground.fillRect(this.barX + 2, this.barY + 2, this.barWidth - 4, this.barHeight - 4);
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
    // 更新进度文本
    this.progressText.setText(`进度: ${this.progress} / ${this.maxProgress}`);
    
    // 清除并重绘进度条
    this.barForeground.clear();
    
    // 计算当前进度宽度
    const progressRatio = this.progress / this.maxProgress;
    const currentWidth = (this.barWidth - 4) * progressRatio;
    
    // 绘制白色进度
    if (currentWidth > 0) {
      this.barForeground.fillStyle(0xffffff, 1);
      this.barForeground.fillRect(
        this.barX + 2,
        this.barY + 2,
        currentWidth,
        this.barHeight - 4
      );
    }
  }

  onComplete() {
    // 停止计时器
    if (this.progressTimer) {
      this.progressTimer.remove();
      this.progressTimer = null;
    }
    
    // 显示完成文本
    this.completeText.setVisible(true);
    this.isComplete = true;
    
    // 添加完成文本的缩放动画
    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
    
    console.log('Progress complete! Final progress:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现中，进度条更新由 TimerEvent 驱动
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
const game = new Phaser.Game(config);