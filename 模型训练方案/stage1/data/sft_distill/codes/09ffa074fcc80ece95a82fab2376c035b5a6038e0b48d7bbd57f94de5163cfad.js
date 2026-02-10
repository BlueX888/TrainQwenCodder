const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 20;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;
  
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
  progressText = this.add.text(centerX, barY - 40, `${progress}/${maxProgress}`, {
    fontSize: '32px',
    color: '#00ffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 60, '完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 存储进度条参数到场景数据中
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）
    callback: onTimerTick,      // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    repeat: maxProgress - 1     // 重复19次（加上初始触发共20次）
  });
  
  // 初始绘制进度条
  updateProgressBar.call(this);
}

function update(time, delta) {
  // 每帧更新进度条显示（虽然进度只在定时器中变化）
  // 这里确保UI与状态同步
}

function onTimerTick() {
  // 增加进度
  progress++;
  
  // 更新进度条和文本
  updateProgressBar.call(this);
  progressText.setText(`${progress}/${maxProgress}`);
  
  // 检查是否完成
  if (progress >= maxProgress) {
    // 停止定时器
    if (timerEvent) {
      timerEvent.remove();
    }
    
    // 显示完成文本
    completeText.setVisible(true);
    
    // 添加完成动画效果
    this.tweens.add({
      targets: completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 300,
      repeat: 2
    });
    
    console.log('进度条已完成！最终进度:', progress);
  }
}

function updateProgressBar() {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度条宽度
  const currentWidth = (progress / maxProgress) * this.barWidth;
  
  // 绘制青色进度条
  progressBar.fillStyle(0x00ffff, 1);
  progressBar.fillRect(this.barX, this.barY, currentWidth, this.barHeight);
}

// 创建游戏实例
new Phaser.Game(config);