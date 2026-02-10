const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let progress = 0;
const MAX_PROGRESS = 10;
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
  
  // 进度条配置
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（边框）
  const barBackground = this.add.graphics();
  barBackground.lineStyle(3, 0x666666, 1);
  barBackground.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（黄色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 30, 'Progress: 0 / 10', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 50, 'Complete!', {
    fontSize: '32px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: increaseProgress,
    callbackScope: this,
    loop: true
  });
  
  // 存储进度条位置和尺寸供 update 使用
  this.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
  
  // 初始绘制进度条
  updateProgressBar.call(this);
}

function increaseProgress() {
  if (progress < MAX_PROGRESS) {
    progress++;
    console.log('Progress:', progress); // 用于验证
    
    // 当进度达到最大值时
    if (progress >= MAX_PROGRESS) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      console.log('Progress bar completed!');
    }
  }
}

function updateProgressBar() {
  const config = this.barConfig;
  const fillWidth = (progress / MAX_PROGRESS) * config.width;
  
  // 清除并重绘进度条
  progressBar.clear();
  progressBar.fillStyle(0xffcc00, 1); // 黄色
  progressBar.fillRect(config.x, config.y, fillWidth, config.height);
  
  // 更新文本
  progressText.setText(`Progress: ${progress} / ${MAX_PROGRESS}`);
}

function update(time, delta) {
  // 每帧更新进度条显示
  updateProgressBar.call(this);
}

new Phaser.Game(config);