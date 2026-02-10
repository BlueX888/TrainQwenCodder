const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量
let progress = 0;
let progressBar;
let progressText;
let completeText;
let timerEvent;

// 验证信号
window.__signals__ = {
  progress: 0,
  isComplete: false,
  logs: []
};

function preload() {
  // 无需加载外部资源
}

function create() {
  const barWidth = 500;
  const barHeight = 40;
  const barX = 150;
  const barY = 280;

  // 创建进度条背景（灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（粉色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, '进度: 0 / 10', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 记录初始状态
  logProgress(0, '进度条初始化');

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true,
    repeat: 9              // 重复9次（从0到10共11个状态，初始0 + 10次增加）
  });
}

function update() {
  // 根据进度值更新进度条显示
  const barWidth = 500;
  const barHeight = 40;
  const barX = 150;
  const barY = 280;

  // 清除并重绘粉色进度条
  progressBar.clear();
  progressBar.fillStyle(0xff69b4, 1); // 粉色
  const currentWidth = (progress / 10) * barWidth;
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
}

function updateProgress() {
  progress++;
  
  // 更新文本显示
  progressText.setText(`进度: ${progress} / 10`);
  
  // 更新验证信号
  window.__signals__.progress = progress;
  logProgress(progress, `进度增加到 ${progress}`);

  // 检查是否完成
  if (progress >= 10) {
    completeProgress();
  }
}

function completeProgress() {
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示完成文本
  completeText.setVisible(true);

  // 更新验证信号
  window.__signals__.isComplete = true;
  logProgress(10, '进度条完成');

  console.log('进度条已完成！');
  console.log('验证信号:', JSON.stringify(window.__signals__, null, 2));
}

function logProgress(value, message) {
  const logEntry = {
    timestamp: Date.now(),
    progress: value,
    message: message
  };
  window.__signals__.logs.push(logEntry);
  console.log(JSON.stringify(logEntry));
}

new Phaser.Game(config);