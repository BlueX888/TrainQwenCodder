const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 5;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 400;
  const barHeight = 40;
  
  // 创建进度条背景（灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);
  
  // 创建进度条前景（黄色）- 初始宽度为0
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, `进度: ${progress}/${maxProgress}`, {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 更新进度的回调函数
  function updateProgress() {
    if (progress < maxProgress) {
      progress++;
      progressText.setText(`进度: ${progress}/${maxProgress}`);
      
      // 当达到最大值时，显示完成并停止计时器
      if (progress >= maxProgress) {
        completeText.setVisible(true);
        timerEvent.remove(); // 停止计时器
        
        // 添加完成动画效果
        this.tweens.add({
          targets: completeText,
          scale: { from: 0.5, to: 1.2 },
          duration: 500,
          ease: 'Back.easeOut'
        });
      }
    }
  }
  
  // 添加说明文本
  const infoText = this.add.text(centerX, 100, '进度条演示：每秒自动增加1', {
    fontSize: '24px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
}

function update(time, delta) {
  // 更新进度条显示
  const centerX = 400;
  const centerY = 300;
  const barWidth = 400;
  const barHeight = 40;
  
  // 清除之前的进度条
  progressBar.clear();
  
  // 计算当前进度的宽度
  const currentWidth = (progress / maxProgress) * barWidth;
  
  // 绘制黄色进度条
  progressBar.fillStyle(0xffdd00, 1);
  progressBar.fillRect(
    centerX - barWidth / 2, 
    centerY - barHeight / 2, 
    currentWidth, 
    barHeight
  );
  
  // 添加进度条边框
  progressBar.lineStyle(3, 0xffffff, 1);
  progressBar.strokeRect(
    centerX - barWidth / 2 - 1.5, 
    centerY - barHeight / 2 - 1.5, 
    barWidth + 3, 
    barHeight + 3
  );
}

// 创建游戏实例
new Phaser.Game(config);