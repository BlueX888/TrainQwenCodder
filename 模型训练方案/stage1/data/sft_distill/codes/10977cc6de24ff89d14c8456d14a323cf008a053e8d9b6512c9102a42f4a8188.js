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
let currentProgress = 0;
const maxProgress = 5;
let progressBar;
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
  
  // 创建进度条背景（深灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const border = this.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '0 / 5', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 50, '完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 存储进度条参数到场景数据中
  this.progressBarData = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: increaseProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始绘制进度条
  updateProgressBar.call(this);
  
  // 添加调试信息
  const debugText = this.add.text(10, 10, 'Progress Bar Demo\nWatch the bar fill up!', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
}

function increaseProgress() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    console.log(`Progress: ${currentProgress}/${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 显示完成文本
      completeText.setVisible(true);
      
      // 添加完成文本的缩放动画
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
      
      console.log('Progress Complete!');
    }
  }
}

function updateProgressBar() {
  const data = this.progressBarData;
  const progress = currentProgress / maxProgress;
  const fillWidth = data.width * progress;
  
  // 清除并重绘进度条
  progressBar.clear();
  progressBar.fillStyle(0xffffff, 1);
  progressBar.fillRect(data.x, data.y, fillWidth, data.height);
  
  // 更新文本
  progressText.setText(`${currentProgress} / ${maxProgress}`);
}

function update(time, delta) {
  // 每帧更新进度条显示
  updateProgressBar.call(this);
}

// 启动游戏
const game = new Phaser.Game(config);