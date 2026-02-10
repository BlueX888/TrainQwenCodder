const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progressValue = 0;
const MAX_PROGRESS = 15;

function preload() {
  // 无需加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 600;
  const barHeight = 40;
  
  // 创建标题文本
  this.add.text(centerX, centerY - 80, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建进度条背景（深灰色边框和填充）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x333333, 1);
  bgGraphics.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);
  bgGraphics.lineStyle(3, 0x666666, 1);
  bgGraphics.strokeRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  const progressGraphics = this.add.graphics();
  this.progressGraphics = progressGraphics;
  
  // 创建进度文本
  const progressText = this.add.text(centerX, centerY, '0 / 15', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  this.progressText = progressText;
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '36px',
    color: '#00ff00',
    fontStyle: 'bold'
  }).setOrigin(0.5).setVisible(false);
  this.completeText = completeText;
  
  // 存储进度条参数
  this.barX = centerX - barWidth / 2;
  this.barY = centerY - barHeight / 2;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
  
  // 初始化进度值
  progressValue = 0;
  
  // 创建定时器事件，每秒增加进度
  this.timerEvent = this.time.addEvent({
    delay: 1000,                    // 每 1000 毫秒（1 秒）
    callback: updateProgress,       // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: MAX_PROGRESS - 1        // 重复 14 次（加上初始执行共 15 次）
  });
  
  // 绘制初始进度条
  drawProgressBar.call(this);
}

function updateProgress() {
  // 增加进度值
  progressValue++;
  
  // 更新进度条和文本
  drawProgressBar.call(this);
  this.progressText.setText(`${progressValue} / ${MAX_PROGRESS}`);
  
  // 检查是否完成
  if (progressValue >= MAX_PROGRESS) {
    // 显示完成文本
    this.completeText.setVisible(true);
    
    // 停止计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.completeText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

function drawProgressBar() {
  // 清除之前的绘制
  this.progressGraphics.clear();
  
  // 计算当前进度宽度
  const progress = progressValue / MAX_PROGRESS;
  const currentWidth = this.barWidth * progress;
  
  // 绘制青色进度条
  this.progressGraphics.fillStyle(0x00ffff, 1);
  this.progressGraphics.fillRect(
    this.barX,
    this.barY,
    currentWidth,
    this.barHeight
  );
  
  // 添加渐变效果（通过叠加半透明白色）
  if (currentWidth > 0) {
    this.progressGraphics.fillStyle(0xffffff, 0.3);
    this.progressGraphics.fillRect(
      this.barX,
      this.barY,
      currentWidth,
      this.barHeight / 2
    );
  }
}

function update(time, delta) {
  // 本示例不需要 update 逻辑，所有更新由 TimerEvent 驱动
}

// 创建游戏实例
new Phaser.Game(config);