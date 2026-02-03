const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progressValue = 0;
let progressMax = 15;
let isCompleted = false;

let progressBarBg;
let progressBarFill;
let progressText;
let completedText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.game.config.width / 2;
  const centerY = this.game.config.height / 2;
  
  // 进度条尺寸
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（深灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x333333, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  progressBarBg.lineStyle(3, 0x666666, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（青色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY, '0 / 15', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建标题文本
  const titleText = this.add.text(centerX, centerY - 80, 'Progress Bar Demo', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, centerY + 80, 'COMPLETED!', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: updateProgress,
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function updateProgress() {
  if (progressValue < progressMax) {
    progressValue++;
    console.log('Progress:', progressValue); // 用于验证
    
    // 检查是否完成
    if (progressValue >= progressMax) {
      isCompleted = true;
      completedText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      console.log('Progress completed!'); // 用于验证
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算填充宽度
  const fillWidth = (progressValue / progressMax) * width;
  
  // 绘制青色填充
  if (fillWidth > 0) {
    progressBarFill.fillStyle(0x00ffff, 1);
    progressBarFill.fillRect(x, y, fillWidth, height);
  }
}

function update(time, delta) {
  // 更新进度条显示
  const centerX = this.game.config.width / 2;
  const centerY = this.game.config.height / 2;
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  drawProgressBar(barX, barY, barWidth, barHeight);
  
  // 更新进度文本
  progressText.setText(`${progressValue} / ${progressMax}`);
  
  // 如果完成，添加闪烁效果
  if (isCompleted) {
    const alpha = Math.sin(time / 200) * 0.5 + 0.5;
    completedText.setAlpha(alpha);
  }
}

// 创建游戏实例
new Phaser.Game(config);