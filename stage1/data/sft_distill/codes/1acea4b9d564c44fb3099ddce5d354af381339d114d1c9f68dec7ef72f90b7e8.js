const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  progress: 0,
  maxProgress: 5,
  isComplete: false,
  logs: []
};

let progressBar;
let progressText;
let completeText;
let currentProgress = 0;
let progressTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 创建进度条背景
  const bgBar = this.add.graphics();
  bgBar.fillStyle(0x333333, 1);
  bgBar.fillRoundedRect(centerX - 200, centerY - 20, 400, 40, 5);
  
  // 创建进度条前景（青色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 60, 'Progress: 0 / 5', {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, 'COMPLETE!', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 初始化进度
  currentProgress = 0;
  updateProgress.call(this);
  
  // 创建定时器，每秒增加1进度
  progressTimer = this.time.addEvent({
    delay: 1000,
    callback: onProgressTick,
    callbackScope: this,
    loop: true
  });
  
  // 记录初始状态
  logProgress('初始化');
}

function update(time, delta) {
  // 每帧更新进度条显示
  drawProgressBar.call(this);
}

function onProgressTick() {
  if (currentProgress < 5) {
    currentProgress++;
    updateProgress.call(this);
    logProgress('进度增加');
    
    // 检查是否完成
    if (currentProgress >= 5) {
      onComplete.call(this);
    }
  }
}

function updateProgress() {
  // 更新文本
  progressText.setText(`Progress: ${currentProgress} / 5`);
  
  // 更新全局信号
  window.__signals__.progress = currentProgress;
}

function drawProgressBar() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 400;
  const barHeight = 40;
  const progressWidth = (currentProgress / 5) * barWidth;
  
  // 清除之前的绘制
  progressBar.clear();
  
  // 绘制青色进度条
  progressBar.fillStyle(0x00ffff, 1);
  progressBar.fillRoundedRect(
    centerX - 200,
    centerY - 20,
    progressWidth,
    barHeight,
    5
  );
}

function onComplete() {
  // 停止计时器
  if (progressTimer) {
    progressTimer.remove();
    progressTimer = null;
  }
  
  // 显示完成文本
  completeText.setVisible(true);
  
  // 更新全局信号
  window.__signals__.isComplete = true;
  logProgress('完成');
  
  // 输出最终状态到控制台
  console.log('Progress Bar Complete!');
  console.log(JSON.stringify(window.__signals__, null, 2));
}

function logProgress(action) {
  const logEntry = {
    timestamp: Date.now(),
    action: action,
    progress: currentProgress,
    maxProgress: 5,
    isComplete: currentProgress >= 5
  };
  
  window.__signals__.logs.push(logEntry);
  console.log(JSON.stringify(logEntry));
}

new Phaser.Game(config);