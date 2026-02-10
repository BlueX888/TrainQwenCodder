const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  progress: 0,
  completed: false
};

let progressValue = 0;
const maxProgress = 15;
let progressBar;
let progressBg;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景（深灰色）
  progressBg = this.add.graphics();
  progressBg.fillStyle(0x333333, 1);
  progressBg.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（浅灰色）
  progressBar = this.add.graphics();

  // 创建进度文字
  progressText = this.add.text(400, 250, '进度: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5, 0.5);

  // 创建完成文字（初始隐藏）
  completeText = this.add.text(400, 350, '完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5, 0.5);
  completeText.setVisible(false);

  // 初始绘制进度条
  updateProgressBar(barX, barY, barWidth, barHeight);

  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true,
    args: [barX, barY, barWidth, barHeight]
  });

  console.log(JSON.stringify({
    type: 'progress_init',
    progress: progressValue,
    maxProgress: maxProgress
  }));
}

function onTimerTick(barX, barY, barWidth, barHeight) {
  if (progressValue < maxProgress) {
    progressValue++;
    
    // 更新信号
    window.__signals__.progress = progressValue;
    
    // 更新进度条显示
    updateProgressBar(barX, barY, barWidth, barHeight);
    
    // 更新文字
    progressText.setText(`进度: ${progressValue} / ${maxProgress}`);
    
    console.log(JSON.stringify({
      type: 'progress_update',
      progress: progressValue,
      maxProgress: maxProgress
    }));

    // 检查是否完成
    if (progressValue >= maxProgress) {
      // 停止定时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 显示完成文字
      completeText.setVisible(true);
      
      // 更新完成状态
      window.__signals__.completed = true;
      
      console.log(JSON.stringify({
        type: 'progress_complete',
        progress: progressValue,
        maxProgress: maxProgress,
        completed: true
      }));
    }
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度比例
  const progress = progressValue / maxProgress;
  const currentWidth = barWidth * progress;
  
  // 绘制进度条前景（灰色）
  progressBar.fillStyle(0x888888, 1);
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
}

function update(time, delta) {
  // 无需每帧更新
}

new Phaser.Game(config);