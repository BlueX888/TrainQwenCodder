const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 5;
let isCompleted = false;

// 游戏对象引用
let progressBar;
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
  const backgroundBar = this.add.graphics();
  backgroundBar.fillStyle(0x555555, 1);
  backgroundBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  backgroundBar.lineStyle(2, 0xffffff, 1);
  backgroundBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（紫色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, `进度: ${progress} / ${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5, 0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, barY + barHeight + 50, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5, 0.5);
  completedText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: onTimerTick,
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 存储场景引用和进度条参数到场景数据
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
}

function onTimerTick() {
  if (progress < maxProgress) {
    progress++;
    
    // 更新进度文本
    progressText.setText(`进度: ${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      isCompleted = true;
      completedText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      console.log('Progress completed!');
    }
  }
}

function update(time, delta) {
  // 根据进度值更新紫色进度条
  const progressRatio = progress / maxProgress;
  const currentWidth = this.barWidth * progressRatio;
  
  // 清除并重绘进度条
  progressBar.clear();
  progressBar.fillStyle(0x9b59b6, 1); // 紫色
  progressBar.fillRect(this.barX, this.barY, currentWidth, this.barHeight);
  
  // 添加渐变效果（可选，让进度条更美观）
  if (currentWidth > 0) {
    progressBar.fillStyle(0xbb79d6, 0.5);
    progressBar.fillRect(this.barX, this.barY, currentWidth, this.barHeight / 2);
  }
}

// 启动游戏
new Phaser.Game(config);

// 导出状态变量供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { progress, maxProgress, isCompleted };
}