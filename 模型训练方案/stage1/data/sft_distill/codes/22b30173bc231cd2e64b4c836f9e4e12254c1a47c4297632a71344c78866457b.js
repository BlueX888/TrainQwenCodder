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
const maxProgress = 20;
let progressBar;
let progressBarBg;
let progressText;
let completeText;
let timerEvent;
let isComplete = false;

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
  
  // 创建进度条前景（粉色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY, '0/20', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建标题文本
  const titleText = this.add.text(centerX, centerY - 80, '进度加载中...', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ff69b4',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建计时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });
  
  // 存储场景引用和进度条参数供 update 使用
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
}

function onTimerTick() {
  if (progress < maxProgress && !isComplete) {
    progress++;
    
    // 当达到最大值时标记完成
    if (progress >= maxProgress) {
      isComplete = true;
      timerEvent.remove(); // 停止计时器
      completeText.setVisible(true);
      
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

function update() {
  // 更新进度条显示
  if (progressBar && !isComplete) {
    progressBar.clear();
    progressBar.fillStyle(0xff69b4, 1); // 粉色
    
    // 计算当前进度条宽度
    const fillWidth = (progress / maxProgress) * this.barWidth;
    progressBar.fillRect(this.barX, this.barY, fillWidth, this.barHeight);
    
    // 更新文本
    progressText.setText(`${progress}/${maxProgress}`);
  } else if (isComplete && progressBar) {
    // 完成时填满进度条
    progressBar.clear();
    progressBar.fillStyle(0xff69b4, 1);
    progressBar.fillRect(this.barX, this.barY, this.barWidth, this.barHeight);
    progressText.setText(`${maxProgress}/${maxProgress}`);
  }
}

// 启动游戏
new Phaser.Game(config);