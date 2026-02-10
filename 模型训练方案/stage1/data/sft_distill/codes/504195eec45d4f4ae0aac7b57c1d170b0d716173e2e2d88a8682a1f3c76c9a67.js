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
  maxProgress: 5,
  isCompleted: false,
  logs: []
};

let progressValue = 0;
const MAX_PROGRESS = 5;
let progressBar;
let progressText;
let completedText;
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
  const bgBar = this.add.graphics();
  bgBar.fillStyle(0x555555, 1);
  bgBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '进度: 0 / 5', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, barY + barHeight + 60, '✓ 完成！', {
    fontSize: '36px',
    color: '#00ffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 初始化进度条
  updateProgressBar.call(this, barX, barY, barWidth, barHeight);
  
  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true,
    args: [barX, barY, barWidth, barHeight]
  });
  
  // 记录初始状态
  logProgress('初始化完成');
}

function onTimerTick(barX, barY, barWidth, barHeight) {
  if (progressValue < MAX_PROGRESS) {
    progressValue++;
    
    // 更新进度条
    updateProgressBar.call(this, barX, barY, barWidth, barHeight);
    
    // 更新文本
    progressText.setText(`进度: ${progressValue} / ${MAX_PROGRESS}`);
    
    // 记录进度
    logProgress(`进度增加到 ${progressValue}`);
    
    // 检查是否完成
    if (progressValue >= MAX_PROGRESS) {
      onProgressComplete.call(this);
    }
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度的宽度
  const progress = progressValue / MAX_PROGRESS;
  const currentWidth = barWidth * progress;
  
  // 绘制青色进度条
  progressBar.fillStyle(0x00ffff, 1);
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
  
  // 添加渐变效果（通过透明度叠加）
  progressBar.fillStyle(0xffffff, 0.3);
  progressBar.fillRect(barX, barY, currentWidth, barHeight / 2);
}

function onProgressComplete() {
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }
  
  // 显示完成文本
  completedText.setVisible(true);
  
  // 添加完成文本的缩放动画
  this.tweens.add({
    targets: completedText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 300,
    yoyo: true,
    repeat: 2
  });
  
  // 更新全局信号
  window.__signals__.isCompleted = true;
  logProgress('进度条完成！');
  
  console.log('进度条已完成！最终状态:', window.__signals__);
}

function logProgress(message) {
  const log = {
    timestamp: Date.now(),
    progress: progressValue,
    maxProgress: MAX_PROGRESS,
    message: message
  };
  
  window.__signals__.progress = progressValue;
  window.__signals__.logs.push(log);
  
  console.log(JSON.stringify(log));
}

function update(time, delta) {
  // 本示例中不需要每帧更新逻辑
}

new Phaser.Game(config);