const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 游戏状态变量
let progress = 0;
const maxProgress = 20;
let progressBar;
let progressBg;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;

  // 创建进度条背景（灰色）
  progressBg = this.add.graphics();
  progressBg.fillStyle(0x555555, 1);
  progressBg.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（紫色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, `进度: ${progress}/${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 360, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 添加标题
  this.add.text(400, 180, '进度条演示', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建定时器，每秒增加1进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });

  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`进度: ${progress}/${maxProgress}`);

    // 检查是否完成
    if (progress >= maxProgress) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
    }
  }
}

function drawProgressBar(x, y, width, height) {
  // 清除之前的绘制
  progressBar.clear();

  // 计算当前进度宽度
  const progressWidth = (progress / maxProgress) * width;

  // 绘制紫色进度条
  progressBar.fillStyle(0x9b59b6, 1); // 紫色
  progressBar.fillRect(x, y, progressWidth, height);

  // 添加边框
  progressBar.lineStyle(2, 0xffffff, 1);
  progressBar.strokeRect(x, y, width, height);
}

function update(time, delta) {
  // 每帧重绘进度条以显示动画效果
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;
  
  drawProgressBar(barX, barY, barWidth, barHeight);
}

// 启动游戏
new Phaser.Game(config);