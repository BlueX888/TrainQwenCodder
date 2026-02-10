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

// 全局状态变量
let progress = 0;
const maxProgress = 15;
let progressBar;
let progressFill;
let progressText;
let completeText;
let timer;
let isComplete = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条尺寸
  const barWidth = 500;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色边框和背景）
  progressBar = this.add.graphics();
  progressBar.fillStyle(0x333333, 1);
  progressBar.fillRect(barX, barY, barWidth, barHeight);
  progressBar.lineStyle(3, 0x666666, 1);
  progressBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（紫色）
  progressFill = this.add.graphics();
  
  // 进度文本（显示当前进度）
  progressText = this.add.text(centerX, centerY, '0 / 15', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 60, '完成！', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 标题文本
  const titleText = this.add.text(centerX, centerY - 80, '进度条演示', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  titleText.setOrigin(0.5);
  
  // 创建定时器，每秒增加进度
  timer = this.time.addEvent({
    delay: 1000, // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 存储进度条参数到场景数据中
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
  
  // 初始绘制
  drawProgressBar.call(this);
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      isComplete = true;
      completeText.setVisible(true);
      timer.destroy(); // 停止计时器
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut'
      });
    }
  }
}

function drawProgressBar() {
  // 清除之前的填充
  progressFill.clear();
  
  // 计算填充宽度
  const fillWidth = (progress / maxProgress) * this.barWidth;
  
  // 绘制紫色填充（带内边距）
  const padding = 4;
  if (fillWidth > 0) {
    progressFill.fillStyle(0x9b59b6, 1); // 紫色
    progressFill.fillRect(
      this.barX + padding,
      this.barY + padding,
      fillWidth - padding * 2,
      this.barHeight - padding * 2
    );
  }
}

function update(time, delta) {
  // 每帧重绘进度条
  drawProgressBar.call(this);
  
  // 可选：添加进度条闪烁效果（当接近完成时）
  if (progress >= maxProgress - 2 && progress < maxProgress && !isComplete) {
    const pulse = Math.sin(time / 200) * 0.3 + 0.7;
    progressFill.setAlpha(pulse);
  } else {
    progressFill.setAlpha(1);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);