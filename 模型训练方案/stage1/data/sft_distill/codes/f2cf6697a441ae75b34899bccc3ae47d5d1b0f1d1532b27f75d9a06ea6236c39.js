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
    this.barBackground = this.add.graphics();
    this.barBackground.fillStyle(0x333333, 1);
    this.barBackground.fillRect(barX, barY, barWidth, barHeight);
    
    // 添加边框
    this.barBackground.lineStyle(3, 0x666666, 1);
    this.barBackground.strokeRect(barX, barY, barWidth, barHeight);
    
    // 创建进度条前景（紫色）
    this.barForeground = this.add.graphics();
    
    // 创建进度文本
    this.progressText = this.add.text(centerX, centerY - 80, '进度: 0 / 3', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.progressText.setOrigin(0.5);
    
    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(centerX, centerY + 80, '完成！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.completeText.setOrigin(0.5);
    this.completeText.setVisible(false);
    
    // 存储进度条位置和尺寸供更新使用
    this.barConfig = {
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight
    };
    
    // 创建定时器，每秒增加进度
    this.progressTimer = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.increaseProgress,
      callbackScope: this,
      loop: true
    });
    
    // 初始绘制进度条
    this.updateProgressBar();
  }

  increaseProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      this.updateProgressBar();
      
      // 更新进度文本
      this.progressText.setText(`进度: ${this.progress} / ${this.maxProgress}`);
      
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
    const currentWidth = this.barConfig.width * progressRatio;
    
    // 绘制紫色进度条
    this.barForeground.fillStyle(0x9b59b6, 1); // 紫色
    this.barForeground.fillRect(
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
    }
    
    // 显示完成文字
    this.completeText.setVisible(true);
    this.isComplete = true;
    
    // 添加完成文字的缩放动画
    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
    
    console.log('进度条已完成！最终进度:', this.progress);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖定时器事件
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