const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建进度条背景（灰色）
  const bgBar = this.add.graphics();
  bgBar.fillStyle(0x666666, 1);
  bgBar.fillRect(200, 280, 400, 40);
  
  // 创建进度条前景（白色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(400, 250, 'Progress: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(400, 350, 'COMPLETED!', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: updateProgress,
    callbackScope: this,
    loop: true
  });
  
  // 初始绘制进度条
  drawProgressBar();
}

function update(time, delta) {
  // 每帧检查进度状态（虽然主要逻辑在timer中）
  // 这里可以添加额外的动画效果
}

function updateProgress() {
  if (progress < 3) {
    progress += 1;
    
    // 更新文本
    progressText.setText(`Progress: ${progress} / 3`);
    
    // 重绘进度条
    drawProgressBar();
    
    // 检查是否完成
    if (progress >= 3) {
      completeText.setVisible(true);
      timerEvent.remove(); // 停止计时器
      
      // 输出状态到控制台（便于验证）
      console.log('Progress completed! Final value:', progress);
    }
  }
}

function drawProgressBar() {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算进度条宽度（总宽度400，按比例）
  const maxWidth = 400;
  const currentWidth = (progress / 3) * maxWidth;
  
  // 绘制白色进度条
  progressBar.fillStyle(0xffffff, 1);
  progressBar.fillRect(200, 280, currentWidth, 40);
}

// 启动游戏
new Phaser.Game(config);