const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量（可验证）
let progress = 0;
let progressBar;
let progressText;
let completeText;
let timerEvent;
let isComplete = false;

function preload() {
  // 无需加载外部资源
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
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, 'Progress: 0/10', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 60, 'COMPLETE!', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 添加标题文本
  const titleText = this.add.text(centerX, 100, 'Progress Bar Demo', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 每秒触发一次
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });
  
  // 存储进度条配置到 scene 数据中
  this.progressBarConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
}

function onTimerTick() {
  if (progress < 10) {
    progress++;
    console.log('Progress updated:', progress);
    
    // 检查是否完成
    if (progress >= 10) {
      isComplete = true;
      timerEvent.remove(); // 停止定时器
      completeText.setVisible(true);
      console.log('Progress complete!');
    }
  }
}

function update() {
  // 更新进度条显示
  if (progressBar && this.progressBarConfig) {
    const config = this.progressBarConfig;
    const fillWidth = (progress / 10) * config.width;
    
    // 清除并重绘进度条
    progressBar.clear();
    progressBar.fillStyle(0x00ffff, 1); // 青色
    progressBar.fillRect(config.x, config.y, fillWidth, config.height);
  }
  
  // 更新进度文本
  if (progressText) {
    progressText.setText(`Progress: ${progress}/10`);
  }
  
  // 添加完成文本的闪烁效果
  if (isComplete && completeText) {
    const alpha = Math.abs(Math.sin(this.time.now / 300));
    completeText.setAlpha(alpha * 0.5 + 0.5); // 0.5 到 1.0 之间闪烁
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);