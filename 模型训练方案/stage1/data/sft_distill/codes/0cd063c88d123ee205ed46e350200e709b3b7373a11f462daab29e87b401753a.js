const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 10;
let progressBar;
let progressBarFill;
let progressText;
let completionText;
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
  
  // 绘制进度条背景（灰色边框和填充）
  progressBar = this.add.graphics();
  progressBar.lineStyle(3, 0x555555, 1);
  progressBar.strokeRect(barX, barY, barWidth, barHeight);
  progressBar.fillStyle(0x333333, 1);
  progressBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 绘制进度条填充（青色）
  progressBarFill = this.add.graphics();
  
  // 进度文字显示
  progressText = this.add.text(centerX, centerY - 80, `进度: ${progress}/${maxProgress}`, {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 完成文字（初始隐藏）
  completionText = this.add.text(centerX, centerY + 80, '完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completionText.setOrigin(0.5);
  completionText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）
    callback: onTimerTick,
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 存储进度条参数供 update 使用
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
}

function onTimerTick() {
  if (progress < maxProgress) {
    progress++;
    console.log(`Progress: ${progress}/${maxProgress}`);
    
    // 更新进度文字
    progressText.setText(`进度: ${progress}/${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      completionText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      console.log('Progress bar completed!');
    }
  }
}

function update(time, delta) {
  // 清除并重绘进度条填充
  progressBarFill.clear();
  
  // 计算当前进度对应的宽度
  const fillWidth = (progress / maxProgress) * this.barWidth;
  
  // 绘制青色进度填充
  if (fillWidth > 0) {
    progressBarFill.fillStyle(0x00ffff, 1);
    progressBarFill.fillRect(
      this.barX + 2,           // 留出边框空间
      this.barY + 2,
      fillWidth - 4,           // 减去边框宽度
      this.barHeight - 4
    );
  }
}

new Phaser.Game(config);