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
let progressValue = 0;
let maxProgress = 12;
let isCompleted = false;

// UI 元素引用
let progressBarBg;
let progressBarFill;
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
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  progressBarBg.lineStyle(3, 0x333333, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（橙色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, '进度: 0 / 12', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器事件：每秒增加1
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1000ms = 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 初始化进度值
  progressValue = 0;
  isCompleted = false;
  
  // 绘制初始进度条
  updateProgressBar(barX, barY, barWidth, barHeight);
}

function onTimerTick() {
  if (progressValue < maxProgress) {
    progressValue++;
    
    // 检查是否完成
    if (progressValue >= maxProgress) {
      isCompleted = true;
      completeText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        duration: 500,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 0
      });
    }
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度百分比
  const progress = progressValue / maxProgress;
  const fillWidth = barWidth * progress;
  
  // 绘制橙色进度条
  if (fillWidth > 0) {
    progressBarFill.fillStyle(0xff8800, 1);
    progressBarFill.fillRect(barX, barY, fillWidth, barHeight);
  }
  
  // 更新文本
  progressText.setText(`进度: ${progressValue} / ${maxProgress}`);
  
  // 如果完成，改变进度条颜色为绿色
  if (isCompleted) {
    progressBarFill.clear();
    progressBarFill.fillStyle(0x00ff00, 1);
    progressBarFill.fillRect(barX, barY, barWidth, barHeight);
  }
}

function update(time, delta) {
  // 每帧更新进度条显示
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  updateProgressBar(barX, barY, barWidth, barHeight);
}

// 创建游戏实例
const game = new Phaser.Game(config);