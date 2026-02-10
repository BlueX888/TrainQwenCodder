const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态变量，用于验证
let progress = 0;
let isCompleted = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;
  const maxProgress = 15;
  
  // 创建标题文本
  const titleText = this.add.text(400, 200, '进度加载中...', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度条背景（深灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x333333, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框（白色）
  bgGraphics.lineStyle(2, 0xffffff, 1);
  bgGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  const progressGraphics = this.add.graphics();
  
  // 创建进度文本
  const progressText = this.add.text(400, 300, '0 / 15', {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 380, '✓ 加载完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontFamily: 'Arial'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 初始化进度
  progress = 0;
  isCompleted = false;
  
  // 绘制进度条的函数
  function drawProgress() {
    progressGraphics.clear();
    
    // 计算当前进度宽度
    const progressWidth = (progress / maxProgress) * barWidth;
    
    // 绘制青色进度条
    progressGraphics.fillStyle(0x00ffff, 1);
    progressGraphics.fillRect(barX, barY, progressWidth, barHeight);
    
    // 更新进度文本
    progressText.setText(`${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress && !isCompleted) {
      isCompleted = true;
      titleText.setText('加载完成');
      completeText.setVisible(true);
      
      // 停止计时器
      if (scene.progressTimer) {
        scene.progressTimer.remove();
      }
      
      console.log('Progress completed!');
    }
  }
  
  // 初始绘制
  drawProgress();
  
  // 创建每秒触发的计时器
  this.progressTimer = this.time.addEvent({
    delay: 1000,           // 1000ms = 1秒
    callback: () => {
      if (progress < maxProgress) {
        progress++;
        drawProgress();
        console.log(`Progress: ${progress}/${maxProgress}`);
      }
    },
    callbackScope: this,
    loop: true             // 循环执行
  });
  
  // 存储引用以便在其他地方访问
  this.progressGraphics = progressGraphics;
  this.progressText = progressText;
  this.drawProgress = drawProgress;
}

function update(time, delta) {
  // 本例中主要逻辑在 TimerEvent 中处理
  // update 可以用于其他实时更新需求
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态变量供外部验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { progress, isCompleted };
}