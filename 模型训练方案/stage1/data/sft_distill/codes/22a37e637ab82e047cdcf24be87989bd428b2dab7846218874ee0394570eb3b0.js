const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量
let progress = 0;
const maxProgress = 3;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;
  
  // 进度条尺寸
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  const backgroundBar = this.add.graphics();
  backgroundBar.fillStyle(0x555555, 1);
  backgroundBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  backgroundBar.lineStyle(3, 0x333333, 1);
  backgroundBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（黄色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, `进度: ${progress} / ${maxProgress}`, {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 60, '✓ 完成！', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 添加说明文本
  this.add.text(centerX, barY + barHeight + 100, '进度条每秒自动增加1', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: incrementProgress,
    callbackScope: this,
    repeat: maxProgress - 1, // 重复2次（0->1, 1->2, 2->3）
    startAt: 0
  });
  
  // 存储进度条配置供 update 使用
  this.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
}

function incrementProgress() {
  progress++;
  console.log(`Progress increased to: ${progress}`);
  
  // 更新进度文本
  progressText.setText(`进度: ${progress} / ${maxProgress}`);
  
  // 检查是否完成
  if (progress >= maxProgress) {
    completeText.setVisible(true);
    console.log('Progress complete!');
    
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

function update(time, delta) {
  // 清除之前的进度条
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressRatio = progress / maxProgress;
  const currentWidth = this.barConfig.width * progressRatio;
  
  // 绘制黄色进度条
  if (currentWidth > 0) {
    progressBar.fillStyle(0xffcc00, 1);
    progressBar.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      currentWidth,
      this.barConfig.height
    );
  }
}

// 创建游戏实例
new Phaser.Game(config);