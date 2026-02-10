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
const maxProgress = 15;
let progressBar;
let progressBarBg;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条参数
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  progressBarBg.lineStyle(2, 0xffffff, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（红色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, '进度: 0/15', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每 1000 毫秒（1秒）触发一次
    callback: updateProgress,
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    console.log(`Progress: ${progress}/${maxProgress}`);
    
    // 更新进度文本
    progressText.setText(`进度: ${progress}/${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      completeProgress();
    }
  }
}

function drawProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度对应的宽度
  const currentWidth = (progress / maxProgress) * barWidth;
  
  // 绘制红色进度条
  if (currentWidth > 0) {
    progressBar.fillStyle(0xff0000, 1);
    progressBar.fillRect(barX, barY, currentWidth, barHeight);
  }
}

function completeProgress() {
  // 停止计时器
  if (timerEvent) {
    timerEvent.remove();
    timerEvent = null;
  }
  
  // 显示完成文本
  completeText.setVisible(true);
  
  // 添加完成动画效果
  completeText.setScale(0);
  completeText.scene.tweens.add({
    targets: completeText,
    scale: 1.2,
    duration: 500,
    ease: 'Back.easeOut',
    yoyo: true,
    repeat: 0,
    onComplete: () => {
      completeText.setScale(1);
    }
  });
  
  console.log('Progress complete!');
}

function update(time, delta) {
  // 每帧重绘进度条
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  drawProgressBar(barX, barY, barWidth, barHeight);
}

// 创建游戏实例
const game = new Phaser.Game(config);