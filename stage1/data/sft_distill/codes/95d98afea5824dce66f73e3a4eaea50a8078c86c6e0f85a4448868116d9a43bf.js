const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 20;

let progressBar;
let progressBarBg;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const barWidth = 400;
  const barHeight = 40;
  const barX = 200;
  const barY = 280;

  // 创建进度条背景（灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（蓝色）
  progressBar = this.add.graphics();

  // 创建进度文本
  progressText = this.add.text(400, 240, '0 / 20', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 350, '完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 创建计时器事件，每秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });

  // 存储进度条参数供 update 使用
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
}

function onTimerTick() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`${progress} / ${maxProgress}`);

    // 检查是否完成
    if (progress >= maxProgress) {
      timerEvent.remove();  // 停止计时器
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
    }
  }
}

function update(time, delta) {
  // 每帧更新进度条宽度
  const fillWidth = (progress / maxProgress) * this.barWidth;
  
  progressBar.clear();
  progressBar.fillStyle(0x0088ff, 1);
  progressBar.fillRect(this.barX, this.barY, fillWidth, this.barHeight);

  // 添加进度条边框
  progressBar.lineStyle(2, 0xffffff, 1);
  progressBar.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
}

new Phaser.Game(config);