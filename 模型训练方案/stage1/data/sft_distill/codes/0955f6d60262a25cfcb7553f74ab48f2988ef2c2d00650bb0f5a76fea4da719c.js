const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progressValue = 0;
let isComplete = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 280;
  
  // 创建进度条背景（深灰色）
  const bgGraphics = scene.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = scene.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色）
  const progressGraphics = scene.add.graphics();
  scene.progressGraphics = progressGraphics;
  
  // 创建进度文本
  const progressText = scene.add.text(400, 240, '0 / 15', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  scene.progressText = progressText;
  
  // 创建完成文本（初始隐藏）
  const completeText = scene.add.text(400, 350, '完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  scene.completeText = completeText;
  
  // 存储进度条配置到scene
  scene.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    maxValue: 15
  };
  
  // 初始化进度值
  progressValue = 0;
  isComplete = false;
  
  // 创建定时器，每秒增加1
  scene.progressTimer = scene.time.addEvent({
    delay: 1000, // 1秒
    callback: updateProgress,
    callbackScope: scene,
    loop: true
  });
  
  // 绘制初始进度条
  drawProgressBar.call(scene);
}

function updateProgress() {
  if (progressValue < 15) {
    progressValue++;
    drawProgressBar.call(this);
    
    // 更新进度文本
    this.progressText.setText(`${progressValue} / 15`);
    
    // 检查是否完成
    if (progressValue >= 15) {
      isComplete = true;
      this.progressTimer.remove(); // 停止计时器
      this.completeText.setVisible(true); // 显示完成文本
      
      // 添加完成动画效果
      this.tweens.add({
        targets: this.completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      console.log('Progress complete! Final value:', progressValue);
    }
  }
}

function drawProgressBar() {
  const config = this.barConfig;
  const progress = progressValue / config.maxValue;
  const currentWidth = config.width * progress;
  
  // 清除并重绘进度条
  this.progressGraphics.clear();
  this.progressGraphics.fillStyle(0xffffff, 1);
  this.progressGraphics.fillRect(
    config.x, 
    config.y, 
    currentWidth, 
    config.height
  );
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前实现主要依赖定时器回调
}

// 创建游戏实例
new Phaser.Game(config);