const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progress = 0;
const MAX_PROGRESS = 20;

let progressBar;
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
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（青色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, `进度: ${progress} / ${MAX_PROGRESS}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 350, '完成！', {
    fontSize: '48px',
    color: '#00ffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });

  // 存储 bar 配置用于绘制
  this.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
}

function onTimerTick() {
  if (progress < MAX_PROGRESS) {
    progress++;
    console.log(`Progress: ${progress}/${MAX_PROGRESS}`);
    
    // 检查是否完成
    if (progress >= MAX_PROGRESS) {
      timerEvent.remove();
      completeText.setVisible(true);
      console.log('Progress Complete!');
    }
  }
}

function update() {
  // 更新进度条显示
  const { x, y, width, height } = this.barConfig;
  const fillWidth = (progress / MAX_PROGRESS) * width;

  progressBar.clear();
  progressBar.fillStyle(0x00ffff, 1); // 青色
  progressBar.fillRect(x, y, fillWidth, height);

  // 更新进度文本
  progressText.setText(`进度: ${progress} / ${MAX_PROGRESS}`);
}

new Phaser.Game(config);