const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态变量
let currentProgress = 0;
let maxProgress = 3;
let progressBar = null;
let progressText = null;
let completeText = null;
let timerEvent = null;
let isComplete = false;

function preload() {
  // 无需预加载外部资源
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
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  background.lineStyle(3, 0x333333, 1);
  background.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（粉色）- 初始宽度为0
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '进度: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 60, '完成！', {
    fontSize: '32px',
    color: '#ff69b4',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 存储进度条配置供 update 使用
  this.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  };
  
  // 创建定时器事件：每秒增加1进度
  timerEvent = this.time.addEvent({
    delay: 1000,                    // 每1000毫秒（1秒）
    callback: updateProgress,       // 回调函数
    callbackScope: this,            // 回调作用域
    loop: true,                     // 循环执行
    repeat: maxProgress - 1         // 重复3次（0->1, 1->2, 2->3）
  });
  
  // 初始绘制进度条
  drawProgressBar.call(this);
}

function update(time, delta) {
  // 每帧更新进度条显示
  drawProgressBar.call(this);
}

// 更新进度的回调函数
function updateProgress() {
  if (currentProgress < maxProgress) {
    currentProgress++;
    
    // 更新进度文本
    progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      isComplete = true;
      completeText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      console.log('进度条已完成！最终进度:', currentProgress);
    }
  }
}

// 绘制进度条的函数
function drawProgressBar() {
  if (!progressBar || !this.barConfig) return;
  
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度百分比
  const progressPercent = currentProgress / maxProgress;
  const currentWidth = this.barConfig.width * progressPercent;
  
  // 绘制粉色进度条
  progressBar.fillStyle(0xff69b4, 1); // 粉色
  progressBar.fillRect(
    this.barConfig.x,
    this.barConfig.y,
    currentWidth,
    this.barConfig.height
  );
  
  // 添加渐变效果（使用稍亮的粉色作为高光）
  if (currentWidth > 0) {
    progressBar.fillStyle(0xffb6d9, 0.5); // 浅粉色半透明
    progressBar.fillRect(
      this.barConfig.x,
      this.barConfig.y,
      currentWidth,
      this.barConfig.height / 3
    );
  }
}

// 创建游戏实例
new Phaser.Game(config);