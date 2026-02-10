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
  
  // 创建进度条前景（紫色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY, `${progress} / ${MAX_PROGRESS}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5, 0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5, 0.5);
  completeText.setVisible(false);
  
  // 添加标题
  this.add.text(centerX, centerY - 80, '进度条演示', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5, 0.5);
  
  // 初始化进度为 0
  progress = 0;
  updateProgressBar(barX, barY, barWidth, barHeight);
  
  // 创建定时器事件，每秒增加 1
  timerEvent = this.time.addEvent({
    delay: 1000, // 1000ms = 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true,
    args: [barX, barY, barWidth, barHeight]
  });
}

function onTimerTick(barX, barY, barWidth, barHeight) {
  if (progress < MAX_PROGRESS) {
    progress++;
    updateProgressBar(barX, barY, barWidth, barHeight);
    progressText.setText(`${progress} / ${MAX_PROGRESS}`);
    
    // 检查是否完成
    if (progress >= MAX_PROGRESS) {
      timerEvent.remove(); // 停止计时器
      completeText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      console.log('Progress complete!'); // 可验证的输出
    }
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的进度条
  progressBar.clear();
  
  // 计算当前进度宽度
  const currentWidth = (progress / MAX_PROGRESS) * barWidth;
  
  // 绘制紫色进度条
  if (currentWidth > 0) {
    progressBar.fillStyle(0x9932cc, 1); // 紫色
    progressBar.fillRect(barX, barY, currentWidth, barHeight);
    
    // 添加渐变效果（使用稍浅的紫色高光）
    progressBar.fillStyle(0xba55d3, 0.5);
    progressBar.fillRect(barX, barY, currentWidth, barHeight / 3);
  }
}

function update(time, delta) {
  // 不需要每帧更新逻辑
}

new Phaser.Game(config);