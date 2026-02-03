const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  progress: 0,
  completed: false,
  logs: []
};

let progressValue = 0;
let progressBar;
let progressBg;
let progressText;
let completedText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景
  progressBg = this.add.graphics();
  progressBg.fillStyle(0x333333, 1);
  progressBg.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景
  progressBar = this.add.graphics();

  // 创建进度文字
  progressText = this.add.text(400, 240, 'Progress: 0/12', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5, 0.5);

  // 创建完成文字（初始隐藏）
  completedText = this.add.text(400, 350, 'COMPLETED!', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5, 0.5);
  completedText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 每1000毫秒（1秒）触发一次
    callback: onTimerTick,
    callbackScope: this,
    loop: true,            // 循环执行
    repeat: 11             // 重复11次（加上第一次共12次，从0到12需要12次增加）
  });

  // 初始化信号
  updateSignals();
}

function onTimerTick() {
  progressValue++;
  
  // 记录日志
  window.__signals__.logs.push({
    time: Date.now(),
    progress: progressValue,
    message: `Progress increased to ${progressValue}`
  });

  // 更新文字
  progressText.setText(`Progress: ${progressValue}/12`);

  // 检查是否完成
  if (progressValue >= 12) {
    completedText.setVisible(true);
    window.__signals__.completed = true;
    window.__signals__.logs.push({
      time: Date.now(),
      progress: progressValue,
      message: 'Progress completed!'
    });
    
    // 停止计时器
    if (timerEvent) {
      timerEvent.remove();
    }
  }

  updateSignals();
}

function update(time, delta) {
  // 重绘进度条
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;
  
  progressBar.clear();
  progressBar.fillStyle(0xff0000, 1); // 红色进度条
  
  // 计算当前进度宽度
  const progress = Math.min(progressValue / 12, 1); // 归一化到 0-1
  const currentWidth = barWidth * progress;
  
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
}

function updateSignals() {
  window.__signals__.progress = progressValue;
  window.__signals__.completed = progressValue >= 12;
}

new Phaser.Game(config);