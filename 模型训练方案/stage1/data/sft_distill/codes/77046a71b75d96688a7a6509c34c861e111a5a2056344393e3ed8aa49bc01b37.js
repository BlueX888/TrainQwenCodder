const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let progressValue = 0;
let maxProgress = 20;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;
  
  // 进度条尺寸
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const border = this.add.graphics();
  border.lineStyle(3, 0x333333, 1);
  border.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（紫色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY, '0 / 20', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5, 0.5);
  
  // 创建标题文本
  const titleText = this.add.text(centerX, barY - 40, '进度加载中...', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  titleText.setOrigin(0.5, 0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 50, '✓ 完成！', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5, 0.5);
  completeText.setVisible(false);
  
  // 存储进度条信息供update使用
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1000ms = 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });
}

function onTimerTick() {
  if (progressValue < maxProgress) {
    progressValue++;
    
    // 更新进度文本
    progressText.setText(`${progressValue} / ${maxProgress}`);
    
    // 检查是否完成
    if (progressValue >= maxProgress) {
      // 停止定时器
      timerEvent.remove();
      
      // 显示完成文本
      completeText.setVisible(true);
      
      // 可选：添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
    }
  }
}

function update(time, delta) {
  // 清除之前的进度条
  progressBar.clear();
  
  // 计算当前进度宽度
  const progress = progressValue / maxProgress;
  const currentWidth = this.barWidth * progress;
  
  // 绘制紫色进度条
  progressBar.fillStyle(0x9b59b6, 1); // 紫色
  progressBar.fillRect(this.barX, this.barY, currentWidth, this.barHeight);
  
  // 可选：添加渐变效果（使用稍亮的紫色）
  if (currentWidth > 0) {
    progressBar.fillStyle(0xbb79d6, 0.5);
    progressBar.fillRect(this.barX, this.barY, currentWidth, this.barHeight / 3);
  }
}

// 创建游戏实例
new Phaser.Game(config);