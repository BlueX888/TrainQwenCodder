const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局状态变量
let currentProgress = 0;
const maxProgress = 12;
let progressBar;
let progressBarFill;
let progressText;
let completionText;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条尺寸
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  progressBar = this.add.graphics();
  progressBar.fillStyle(0x555555, 1);
  progressBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 添加边框
  progressBar.lineStyle(3, 0x333333, 1);
  progressBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（橙色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '0 / 12', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completionText = this.add.text(centerX, barY + barHeight + 60, '✓ 完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completionText.setOrigin(0.5);
  completionText.setVisible(false);
  
  // 创建标题文本
  const titleText = this.add.text(centerX, 100, '进度条演示', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#ffaa00',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建定时器：每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始绘制进度条
  drawProgressBar.call(this, barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 可以在这里添加动画效果，但当前实现主要依赖定时器
}

function updateProgress() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    
    // 更新文本
    progressText.setText(`${currentProgress} / ${maxProgress}`);
    
    // 重绘进度条
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const barWidth = 600;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;
    
    drawProgressBar.call(this, barX, barY, barWidth, barHeight);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      completionText.setVisible(true);
      timerEvent.destroy(); // 停止定时器
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completionText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      // 进度条变为绿色
      progressBarFill.clear();
      progressBarFill.fillStyle(0x00ff00, 1);
      progressBarFill.fillRect(barX + 3, barY + 3, barWidth - 6, barHeight - 6);
    }
  }
}

function drawProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度宽度
  const progressWidth = ((barWidth - 6) * currentProgress) / maxProgress;
  
  // 绘制橙色进度填充
  if (currentProgress > 0) {
    progressBarFill.fillStyle(0xff8800, 1);
    progressBarFill.fillRect(barX + 3, barY + 3, progressWidth, barHeight - 6);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);