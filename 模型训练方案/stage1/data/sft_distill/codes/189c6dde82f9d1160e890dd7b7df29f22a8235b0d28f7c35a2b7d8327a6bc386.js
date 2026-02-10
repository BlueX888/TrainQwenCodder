const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progress = 0;
const maxProgress = 20;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 600;
  const barHeight = 40;
  
  // 创建进度条背景（灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);
  
  // 创建进度条前景（粉色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, '0 / 20', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#ff69b4',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: incrementProgress,
    callbackScope: this,
    loop: true
  });
  
  // 存储进度条参数供 update 使用
  this.barConfig = {
    x: centerX - barWidth / 2,
    y: centerY - barHeight / 2,
    width: barWidth,
    height: barHeight
  };
}

function incrementProgress() {
  if (progress < maxProgress) {
    progress++;
    progressText.setText(`${progress} / ${maxProgress}`);
    
    // 当达到最大值时
    if (progress >= maxProgress) {
      timerEvent.remove(); // 停止计时器
      completeText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut'
      });
    }
  }
}

function update(time, delta) {
  // 更新进度条显示
  const config = this.barConfig;
  const fillWidth = (progress / maxProgress) * config.width;
  
  progressBar.clear();
  progressBar.fillStyle(0xff69b4, 1); // 粉色
  progressBar.fillRect(config.x, config.y, fillWidth, config.height);
  
  // 添加进度条光泽效果
  if (fillWidth > 0) {
    progressBar.fillStyle(0xffb6d9, 0.5); // 更浅的粉色作为高光
    progressBar.fillRect(config.x, config.y, fillWidth, config.height / 3);
  }
}

new Phaser.Game(config);