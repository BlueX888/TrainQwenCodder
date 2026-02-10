const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态变量
let progressValue = 0;
const maxProgress = 10;
let isCompleted = false;

// UI 元素引用
let progressBar;
let progressFill;
let progressText;
let completedText;
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
  progressBar = this.add.graphics();
  progressBar.fillStyle(0x555555, 1);
  progressBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  progressBar.lineStyle(3, 0x333333, 1);
  progressBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  progressFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '0 / 10', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, barY + barHeight + 60, '✓ 完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 添加标题
  const titleText = this.add.text(centerX, 100, '进度条演示', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  titleText.setOrigin(0.5);
  
  // 创建定时器事件：每秒增加1点进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,   // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    startAt: 0                  // 立即开始
  });
  
  // 初始绘制进度条
  drawProgressBar.call(this);
}

function updateProgress() {
  if (progressValue < maxProgress) {
    progressValue++;
    
    // 更新进度文本
    progressText.setText(`${progressValue} / ${maxProgress}`);
    
    // 重绘进度条
    drawProgressBar.call(this);
    
    // 检查是否完成
    if (progressValue >= maxProgress) {
      isCompleted = true;
      timerEvent.remove(); // 停止计时器
      completedText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completedText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      console.log('Progress completed!');
    }
  }
}

function drawProgressBar() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 清除之前的填充
  progressFill.clear();
  
  // 计算当前进度宽度
  const fillWidth = (progressValue / maxProgress) * barWidth;
  
  // 绘制青色进度填充
  if (fillWidth > 0) {
    progressFill.fillStyle(0x00ffff, 1);
    progressFill.fillRect(barX, barY, fillWidth, barHeight);
    
    // 添加渐变效果（通过多个半透明矩形模拟）
    progressFill.fillStyle(0xffffff, 0.3);
    progressFill.fillRect(barX, barY, fillWidth, barHeight / 2);
  }
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前实现主要依赖 TimerEvent
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getProgress: () => progressValue,
    getMaxProgress: () => maxProgress,
    isCompleted: () => isCompleted
  };
}