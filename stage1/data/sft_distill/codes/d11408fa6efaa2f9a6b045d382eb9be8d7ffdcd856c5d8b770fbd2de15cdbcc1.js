const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  progress: 0,
  maxProgress: 10,
  completed: false,
  elapsedTime: 0
};

let progressBar;
let progressBarBg;
let progressText;
let completedText;
let currentProgress = 0;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 创建标题文本
  const titleText = this.add.text(centerX, centerY - 80, 'Progress Bar Demo', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度条背景
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRoundedRect(centerX - 200, centerY - 20, 400, 40, 10);
  
  // 创建进度条前景
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY, '0 / 10', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, centerY + 80, 'COMPLETED!', {
    fontSize: '36px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: incrementProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始化信号
  updateSignals();
  
  console.log('Progress bar initialized:', JSON.stringify(window.__signals__));
}

function incrementProgress() {
  if (currentProgress < 10) {
    currentProgress++;
    
    // 更新进度文本
    progressText.setText(`${currentProgress} / 10`);
    
    // 更新信号
    updateSignals();
    
    console.log('Progress updated:', JSON.stringify(window.__signals__));
    
    // 检查是否完成
    if (currentProgress >= 10) {
      timerEvent.remove();
      completedText.setVisible(true);
      window.__signals__.completed = true;
      console.log('Progress completed:', JSON.stringify(window.__signals__));
    }
  }
}

function update(time, delta) {
  // 更新经过的时间
  window.__signals__.elapsedTime = Math.floor(time / 1000);
  
  // 重绘进度条
  drawProgressBar();
}

function drawProgressBar() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 400;
  const barHeight = 40;
  const padding = 4;
  
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressWidth = ((barWidth - padding * 2) * currentProgress) / 10;
  
  if (progressWidth > 0) {
    // 绘制粉色进度条
    progressBar.fillStyle(0xff69b4, 1); // 粉色
    progressBar.fillRoundedRect(
      centerX - 200 + padding,
      centerY - 20 + padding,
      progressWidth,
      barHeight - padding * 2,
      8
    );
  }
}

function updateSignals() {
  window.__signals__.progress = currentProgress;
  window.__signals__.completed = currentProgress >= 10;
}

new Phaser.Game(config);