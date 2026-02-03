const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  progress: 0,
  maxProgress: 15,
  isComplete: false,
  logs: []
};

let progressBar;
let progressBg;
let progressText;
let completeText;
let currentProgress = 0;
const MAX_PROGRESS = 15;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景（灰色）
  progressBg = this.add.graphics();
  progressBg.fillStyle(0x808080, 1);
  progressBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  progressBg.lineStyle(2, 0x000000, 1);
  progressBg.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条（绿色）
  progressBar = this.add.graphics();

  // 显示进度文本
  progressText = this.add.text(400, 250, '进度: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 完成文本（初始隐藏）
  completeText = this.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
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

  // 初始化信号
  window.__signals__.progress = 0;
  window.__signals__.logs.push({
    time: 0,
    progress: 0,
    message: 'Progress bar initialized'
  });

  console.log(JSON.stringify({
    event: 'init',
    progress: 0,
    maxProgress: MAX_PROGRESS
  }));
}

function updateProgress() {
  if (currentProgress < MAX_PROGRESS) {
    currentProgress++;
    
    // 更新信号
    window.__signals__.progress = currentProgress;
    window.__signals__.logs.push({
      time: Date.now(),
      progress: currentProgress,
      message: `Progress updated to ${currentProgress}`
    });

    // 输出日志
    console.log(JSON.stringify({
      event: 'progress_update',
      progress: currentProgress,
      maxProgress: MAX_PROGRESS,
      percentage: (currentProgress / MAX_PROGRESS * 100).toFixed(1) + '%'
    }));

    // 检查是否完成
    if (currentProgress >= MAX_PROGRESS) {
      completeProgress.call(this);
    }
  }
}

function completeProgress() {
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示完成文本
  completeText.setVisible(true);

  // 更新信号
  window.__signals__.isComplete = true;
  window.__signals__.logs.push({
    time: Date.now(),
    progress: currentProgress,
    message: 'Progress completed'
  });

  // 输出完成日志
  console.log(JSON.stringify({
    event: 'complete',
    progress: currentProgress,
    maxProgress: MAX_PROGRESS,
    isComplete: true
  }));
}

function update(time, delta) {
  // 清除之前的进度条
  progressBar.clear();

  // 计算进度条宽度
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;
  const progressWidth = (currentProgress / MAX_PROGRESS) * barWidth;

  // 绘制当前进度（绿色）
  if (progressWidth > 0) {
    progressBar.fillStyle(0x00ff00, 1);
    progressBar.fillRect(barX, barY, progressWidth, barHeight);
  }

  // 更新进度文本
  progressText.setText(`进度: ${currentProgress} / ${MAX_PROGRESS}`);
}

new Phaser.Game(config);