const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量（可验证）
let progress = 0;
let maxProgress = 3;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
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
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  bgGraphics.lineStyle(3, 0x888888, 1);
  bgGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（绿色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, 'Progress: 0 / 3', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 50, 'COMPLETE!', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 初始化进度值
  progress = 0;
  
  // 创建定时器事件：每秒增加1进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 存储场景引用和进度条参数，供 update 使用
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`Progress: ${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
    }
  }
}

function update(time, delta) {
  // 更新进度条显示
  progressBar.clear();
  
  if (progress > 0) {
    // 计算当前进度条宽度
    const progressWidth = (progress / maxProgress) * this.barWidth;
    
    // 绘制绿色进度条
    progressBar.fillStyle(0x00ff00, 1);
    progressBar.fillRect(this.barX, this.barY, progressWidth, this.barHeight);
  }
}

// 启动游戏
new Phaser.Game(config);