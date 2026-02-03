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

// 游戏状态变量
let progress = 0;
let maxProgress = 5;
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
  const barWidth = 400;
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
  
  // 创建进度条填充（紫色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文字
  progressText = this.add.text(centerX, centerY - 80, '进度: 0 / 5', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文字（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始绘制进度条
  drawProgressBar.call(this, barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 每帧更新显示（虽然进度每秒更新一次）
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`进度: ${progress} / ${maxProgress}`);
    
    // 当进度满时
    if (progress >= maxProgress) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
    }
  }
}

function drawProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度的宽度
  const fillWidth = (progress / maxProgress) * barWidth;
  
  // 绘制紫色进度条
  progressBarFill.fillStyle(0x9b59b6, 1); // 紫色
  progressBarFill.fillRect(barX, barY, fillWidth, barHeight);
  
  // 添加渐变效果（通过叠加半透明矩形模拟）
  progressBarFill.fillStyle(0xffffff, 0.2);
  progressBarFill.fillRect(barX, barY, fillWidth, barHeight / 2);
}

// 在 updateProgress 函数中添加重绘调用
function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`进度: ${progress} / ${maxProgress}`);
    
    // 重绘进度条
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;
    drawProgressBar(barX, barY, barWidth, barHeight);
    
    // 当进度满时
    if (progress >= maxProgress) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
    }
  }
}

// 启动游戏
new Phaser.Game(config);