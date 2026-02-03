const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  progress: 0,
  maxProgress: 10,
  isCompleted: false,
  elapsedTime: 0
};

let progressValue = 0;
const maxProgress = 10;
let progressBar;
let progressBg;
let progressText;
let completionText;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  const barWidth = 500;
  const barHeight = 40;
  const barX = 150;
  const barY = 280;

  // 创建进度条背景（灰色）
  progressBg = this.add.graphics();
  progressBg.fillStyle(0x555555, 1);
  progressBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  progressBg.lineStyle(3, 0x333333, 1);
  progressBg.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（粉色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, `进度: ${progressValue} / ${maxProgress}`, {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completionText = this.add.text(400, 360, '🎉 完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ff69b4',
    align: 'center',
    fontStyle: 'bold'
  });
  completionText.setOrigin(0.5);
  completionText.setVisible(false);

  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });

  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);

  console.log(JSON.stringify({
    event: 'game_started',
    progress: progressValue,
    maxProgress: maxProgress
  }));
}

function updateProgress() {
  if (progressValue < maxProgress) {
    progressValue++;
    
    // 更新全局信号
    window.__signals__.progress = progressValue;
    
    // 更新进度文本
    progressText.setText(`进度: ${progressValue} / ${maxProgress}`);

    console.log(JSON.stringify({
      event: 'progress_updated',
      progress: progressValue,
      percentage: (progressValue / maxProgress * 100).toFixed(0) + '%'
    }));

    // 检查是否完成
    if (progressValue >= maxProgress) {
      onComplete();
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的绘制
  progressBar.clear();

  // 计算当前进度的宽度
  const progressWidth = (progressValue / maxProgress) * width;

  // 绘制粉色进度条
  if (progressWidth > 0) {
    progressBar.fillStyle(0xff69b4, 1); // 粉色
    progressBar.fillRect(x, y, progressWidth, height);
  }
}

function onComplete() {
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }

  // 显示完成文本
  completionText.setVisible(true);

  // 添加完成动画效果
  completionText.setScale(0);
  completionText.scene.tweens.add({
    targets: completionText,
    scale: 1.2,
    duration: 500,
    ease: 'Back.easeOut',
    yoyo: true,
    repeat: 0,
    onComplete: () => {
      completionText.setScale(1);
    }
  });

  // 更新全局信号
  window.__signals__.isCompleted = true;

  console.log(JSON.stringify({
    event: 'progress_completed',
    progress: progressValue,
    completedAt: Date.now()
  }));
}

function update(time, delta) {
  // 更新经过的时间
  window.__signals__.elapsedTime = time;

  // 每帧重绘进度条以保持视觉更新
  const barWidth = 500;
  const barHeight = 40;
  const barX = 150;
  const barY = 280;
  drawProgressBar(barX, barY, barWidth, barHeight);
}

new Phaser.Game(config);