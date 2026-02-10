const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量（可验证）
let progress = 0;
let isCompleted = false;

// 进度条相关对象
let progressBarBg;
let progressBarFill;
let progressText;
let completedText;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  const barWidth = 400;
  const barHeight = 40;
  const barX = 200;
  const barY = 280;

  // 创建进度条背景（灰色边框）
  progressBarBg = this.add.graphics();
  progressBarBg.lineStyle(4, 0x666666, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  progressBarBg.fillStyle(0x222222, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条填充（蓝色）
  progressBarFill = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, 'Progress: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completedText = this.add.text(400, 350, 'Completed!', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });

  // 初始化进度条显示
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 每帧检查是否需要更新显示
  // 主要逻辑在定时器回调中处理
}

function updateProgress() {
  if (progress < 3) {
    progress++;
    
    // 更新进度文本
    progressText.setText(`Progress: ${progress} / 3`);
    
    // 重绘进度条
    const barWidth = 400;
    const barHeight = 40;
    const barX = 200;
    const barY = 280;
    drawProgressBar(barX, barY, barWidth, barHeight);
    
    // 检查是否完成
    if (progress >= 3) {
      isCompleted = true;
      completedText.setVisible(true);
      
      // 停止定时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 输出状态到控制台（用于验证）
      console.log('Progress completed!', { progress, isCompleted });
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度宽度
  const fillWidth = (progress / 3) * width;
  
  // 绘制蓝色进度填充
  progressBarFill.fillStyle(0x0088ff, 1);
  progressBarFill.fillRect(x, y, fillWidth, height);
}

// 启动游戏
new Phaser.Game(config);