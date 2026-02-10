const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let currentProgress = 0;
const maxProgress = 20;
let isCompleted = false;

// 游戏对象引用
let progressBarForeground;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
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
  const progressBarBackground = this.add.graphics();
  progressBarBackground.fillStyle(0x555555, 1);
  progressBarBackground.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  progressBarBackground.lineStyle(3, 0x888888, 1);
  progressBarBackground.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色）
  progressBarForeground = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, '0/20', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建标题文本
  const titleText = this.add.text(centerX, centerY - 120, '进度条演示', {
    fontSize: '24px',
    color: '#aaaaaa'
  });
  titleText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器事件，每秒增加1点进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）
    callback: onTimerTick,      // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true                  // 循环执行
  });
  
  // 初始绘制进度条
  updateProgressBar();
}

function update(time, delta) {
  // 主要逻辑在定时器回调中处理
  // 这里可以添加其他更新逻辑
}

// 定时器回调函数
function onTimerTick() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    
    // 更新进度条显示
    updateProgressBar();
    
    // 更新进度文本
    progressText.setText(`${currentProgress}/${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      onProgressComplete();
    }
  }
}

// 更新进度条显示
function updateProgressBar() {
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 清除之前的绘制
  progressBarForeground.clear();
  
  // 计算当前进度条宽度
  const progressRatio = currentProgress / maxProgress;
  const currentBarWidth = barWidth * progressRatio;
  
  // 绘制白色进度条
  progressBarForeground.fillStyle(0xffffff, 1);
  progressBarForeground.fillRect(barX, barY, currentBarWidth, barHeight);
}

// 进度完成处理
function onProgressComplete() {
  isCompleted = true;
  
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }
  
  // 显示完成文字
  completeText.setVisible(true);
  
  // 添加完成动画效果
  completeText.setScale(0);
  completeText.scene.tweens.add({
    targets: completeText,
    scale: 1,
    duration: 500,
    ease: 'Back.easeOut'
  });
  
  // 控制台输出状态（便于验证）
  console.log('Progress completed!', {
    currentProgress: currentProgress,
    maxProgress: maxProgress,
    isCompleted: isCompleted
  });
}

// 启动游戏
new Phaser.Game(config);