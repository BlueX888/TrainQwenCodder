const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progress = 0;
const maxProgress = 10;

let progressBarBg;
let progressBarFill;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条尺寸
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（黄色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 30, '0/10', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 40, '完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 初始化进度
  progress = 0;
  
  // 创建定时器事件，每秒增加1
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始绘制
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 每帧更新显示（虽然数据每秒更新一次）
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    
    // 更新文本
    progressText.setText(`${progress}/${maxProgress}`);
    
    // 重绘进度条
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;
    
    drawProgressBar(barX, barY, barWidth, barHeight);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut'
      });
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度的宽度
  const fillWidth = (progress / maxProgress) * width;
  
  // 绘制黄色进度条
  progressBarFill.fillStyle(0xffcc00, 1);
  progressBarFill.fillRect(x, y, fillWidth, height);
  
  // 添加边框
  progressBarFill.lineStyle(2, 0xffffff, 1);
  progressBarFill.strokeRect(x, y, width, height);
}

new Phaser.Game(config);