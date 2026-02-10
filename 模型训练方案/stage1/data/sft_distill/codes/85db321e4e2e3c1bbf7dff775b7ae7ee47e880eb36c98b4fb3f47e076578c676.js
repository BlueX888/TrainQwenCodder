const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progress = 0;
let maxProgress = 5;
let isCompleted = false;

let progressBar;
let progressBarBg;
let progressText;
let completedText;
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
  
  // 创建进度条背景（深灰色边框）
  progressBarBg = this.add.graphics();
  progressBarBg.lineStyle(4, 0x666666, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  progressBarBg.fillStyle(0x333333, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色填充）
  progressBar = this.add.graphics();
  
  // 进度文本
  progressText = this.add.text(centerX, barY - 40, 'Progress: 0 / 5', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 完成文本（初始隐藏）
  completedText = this.add.text(centerX, barY + barHeight + 60, 'Completed!', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: updateProgress,   // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    repeat: -1                  // 无限重复
  });
  
  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`Progress: ${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      isCompleted = true;
      completedText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      
      console.log('Progress completed!'); // 可验证的状态信号
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度百分比
  const percentage = progress / maxProgress;
  const currentWidth = width * percentage;
  
  // 绘制白色进度条
  if (currentWidth > 0) {
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(x, y, currentWidth, height);
  }
}

function update(time, delta) {
  // 每帧重绘进度条
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  drawProgressBar(barX, barY, barWidth, barHeight);
}

// 启动游戏
new Phaser.Game(config);