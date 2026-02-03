const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let currentProgress = 0;
let maxProgress = 3;
let isCompleted = false;

let progressBarBg;
let progressBarFill;
let progressText;
let completedText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const barWidth = 400;
  const barHeight = 40;
  const barX = 200;
  const barY = 280;

  // 创建进度条背景（深灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x444444, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  progressBarBg.lineStyle(3, 0x666666, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条填充（紫色）
  progressBarFill = this.add.graphics();

  // 进度文本
  progressText = this.add.text(400, 240, '进度: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);

  // 完成文本（初始隐藏）
  completedText = this.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);

  // 添加标题
  this.add.text(400, 150, '进度条演示', {
    fontSize: '36px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 每1000毫秒（1秒）触发一次
    callback: updateProgress,
    callbackScope: this,
    repeat: maxProgress    // 重复3次（0->1, 1->2, 2->3）
  });

  console.log('进度条初始化完成');
}

function updateProgress() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    console.log('进度更新:', currentProgress);
    
    // 更新进度文本
    progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      isCompleted = true;
      completedText.setVisible(true);
      console.log('进度条已完成！');
    }
  }
}

function update(time, delta) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 根据当前进度绘制紫色填充
  if (currentProgress > 0) {
    const barWidth = 400;
    const barHeight = 40;
    const barX = 200;
    const barY = 280;
    
    // 计算填充宽度
    const fillWidth = (currentProgress / maxProgress) * barWidth;
    
    // 绘制紫色进度
    progressBarFill.fillStyle(0x9933ff, 1);
    progressBarFill.fillRect(barX, barY, fillWidth, barHeight);
  }
  
  // 完成后添加闪烁效果
  if (isCompleted) {
    const blinkSpeed = Math.sin(time / 200) * 0.5 + 0.5;
    completedText.setAlpha(blinkSpeed);
  }
}

new Phaser.Game(config);