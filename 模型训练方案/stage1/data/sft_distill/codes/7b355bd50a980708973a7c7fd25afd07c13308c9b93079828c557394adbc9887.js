const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  progress: 0,
  maxProgress: 15,
  completed: false,
  logs: []
};

let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;

  // 创建进度条背景（灰色边框）
  const bgGraphics = this.add.graphics();
  bgGraphics.lineStyle(3, 0x666666, 1);
  bgGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建灰色背景填充
  bgGraphics.fillStyle(0x333333, 1);
  bgGraphics.fillRect(barX + 2, barY + 2, barWidth - 4, barHeight - 4);

  // 创建进度条填充（绿色）
  progressBar = this.add.graphics();

  // 创建进度文字
  progressText = this.add.text(centerX, centerY, '0 / 15', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);

  // 创建完成文字（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '完成！', {
    fontSize: '36px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });

  // 初始化进度
  updateProgressBar.call(this, 0);

  // 记录初始状态
  logProgress(0);
}

function updateProgress() {
  const currentProgress = window.__signals__.progress;
  
  if (currentProgress < 15) {
    const newProgress = currentProgress + 1;
    window.__signals__.progress = newProgress;
    
    // 更新进度条显示
    updateProgressBar.call(this, newProgress);
    
    // 记录日志
    logProgress(newProgress);
    
    // 检查是否完成
    if (newProgress >= 15) {
      completeProgress.call(this);
    }
  }
}

function updateProgressBar(progress) {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 清除之前的进度条
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressWidth = ((barWidth - 4) * progress) / 15;
  
  // 绘制进度条（绿色到黄色渐变）
  const color = progress < 10 ? 0x00ff00 : (progress < 15 ? 0xffff00 : 0x00ff00);
  progressBar.fillStyle(color, 1);
  progressBar.fillRect(barX + 2, barY + 2, progressWidth, barHeight - 4);
  
  // 更新文字
  progressText.setText(`${progress} / 15`);
}

function completeProgress() {
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
  }
  
  // 显示完成文字
  completeText.setVisible(true);
  
  // 添加完成动画效果
  this.tweens.add({
    targets: completeText,
    scaleX: 1.2,
    scaleY: 1.2,
    yoyo: true,
    duration: 300,
    repeat: 2
  });
  
  // 更新信号状态
  window.__signals__.completed = true;
  window.__signals__.logs.push({
    timestamp: Date.now(),
    event: 'completed',
    progress: 15
  });
  
  console.log('Progress Complete!', JSON.stringify(window.__signals__));
}

function logProgress(progress) {
  window.__signals__.logs.push({
    timestamp: Date.now(),
    event: 'progress_update',
    progress: progress
  });
  
  console.log(`Progress: ${progress}/15`, JSON.stringify({
    progress: window.__signals__.progress,
    completed: window.__signals__.completed
  }));
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);