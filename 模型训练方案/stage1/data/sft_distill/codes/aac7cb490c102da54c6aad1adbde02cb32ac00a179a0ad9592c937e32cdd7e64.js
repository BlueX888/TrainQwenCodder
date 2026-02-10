const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态变量
let progress = 0;
let progressBar = null;
let progressText = null;
let completeText = null;
let timerEvent = null;

const BAR_WIDTH = 400;
const BAR_HEIGHT = 40;
const BAR_X = 200;
const BAR_Y = 280;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 标题文本
  const titleText = this.add.text(400, 150, '进度条示例', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);

  // 创建进度条背景（灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

  // 创建进度条前景（黄色）
  progressBar = this.add.graphics();

  // 进度文本
  progressText = this.add.text(400, 350, '进度: 0 / 5', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 完成文本（初始隐藏）
  completeText = this.add.text(400, 420, '✓ 完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 每 1000 毫秒（1秒）
    callback: updateProgress,
    callbackScope: this,
    repeat: 4              // 重复 4 次（0->1->2->3->4->5，共 5 次增加）
  });

  // 初始绘制进度条
  drawProgressBar();
}

function updateProgress() {
  progress++;
  
  // 更新进度文本
  progressText.setText(`进度: ${progress} / 5`);
  
  // 检查是否完成
  if (progress >= 5) {
    completeText.setVisible(true);
    // 添加完成动画效果
    this.tweens.add({
      targets: completeText,
      scale: { from: 0.8, to: 1.2 },
      duration: 300,
      yoyo: true,
      repeat: 0
    });
  }
}

function drawProgressBar() {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressWidth = (progress / 5) * BAR_WIDTH;
  
  // 绘制黄色进度条
  progressBar.fillStyle(0xffcc00, 1);
  progressBar.fillRect(BAR_X, BAR_Y, progressWidth, BAR_HEIGHT);
  
  // 添加边框
  progressBar.lineStyle(3, 0xffffff, 1);
  progressBar.strokeRect(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
}

function update(time, delta) {
  // 每帧重绘进度条以反映最新进度
  drawProgressBar();
  
  // 可选：显示计时器剩余时间
  if (timerEvent && progress < 5) {
    const remaining = timerEvent.getRemaining();
    // console.log('Next update in:', remaining);
  }
}

// 创建游戏实例
new Phaser.Game(config);