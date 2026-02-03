const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态变量
let currentProgress = 0;
const maxProgress = 3;
let progressBar = null;
let progressText = null;
let completeText = null;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const barWidth = 400;
  const barHeight = 40;
  const barX = 200;
  const barY = 280;

  // 创建进度条背景（灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条边框
  const border = this.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

  // 创建进度条前景（红色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 350, `进度: ${currentProgress}/${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建标题文本
  const titleText = this.add.text(400, 200, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 420, '✓ 完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 初始绘制进度条
  updateProgressBar.call(this, barX, barY, barWidth, barHeight);

  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onProgressUpdate,
    callbackScope: this,
    repeat: maxProgress, // 重复3次（0->1, 1->2, 2->3, 3->完成）
    args: [barX, barY, barWidth, barHeight]
  });
}

function onProgressUpdate(barX, barY, barWidth, barHeight) {
  // 增加进度
  currentProgress++;

  // 更新进度条
  updateProgressBar.call(this, barX, barY, barWidth, barHeight);

  // 更新进度文本
  progressText.setText(`进度: ${currentProgress}/${maxProgress}`);

  // 检查是否完成
  if (currentProgress >= maxProgress) {
    completeText.setVisible(true);
    console.log('Progress Complete! Final value:', currentProgress);
    
    // 添加完成动画效果
    this.tweens.add({
      targets: completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();

  // 计算当前进度宽度
  const progress = currentProgress / maxProgress;
  const currentWidth = barWidth * progress;

  // 绘制红色进度条
  progressBar.fillStyle(0xff0000, 1);
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 启动游戏
new Phaser.Game(config);