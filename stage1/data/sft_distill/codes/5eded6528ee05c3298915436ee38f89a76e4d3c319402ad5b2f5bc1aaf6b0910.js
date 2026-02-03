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

// 全局状态变量（可验证）
let progress = 0;
const MAX_PROGRESS = 15;
let progressBar;
let progressText;
let completionText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
  
  // 创建进度条前景（紫色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 50, '进度: 0 / 15', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completionText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completionText.setOrigin(0.5);
  completionText.setVisible(false);
  
  // 存储进度条配置到场景数据
  this.registry.set('barConfig', {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight
  });
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）
    callback: updateProgress,   // 回调函数
    callbackScope: this,        // 回调作用域
    loop: true,                 // 循环执行
    repeat: MAX_PROGRESS - 1    // 重复14次（加上初始的0，共15次）
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
  if (progress < MAX_PROGRESS) {
    progress++;
    progressText.setText(`进度: ${progress} / ${MAX_PROGRESS}`);
    
    // 当进度达到最大值时
    if (progress >= MAX_PROGRESS) {
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 显示完成文本
      completionText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completionText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
      
      console.log('进度条已完成！');
    }
  }
}

// 绘制进度条
function drawProgressBar() {
  const barConfig = this.registry.get('barConfig');
  if (!barConfig) return;
  
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressWidth = (progress / MAX_PROGRESS) * barConfig.width;
  
  // 绘制紫色进度条
  progressBar.fillStyle(0x9b59b6, 1); // 紫色
  progressBar.fillRect(
    barConfig.x,
    barConfig.y,
    progressWidth,
    barConfig.height
  );
  
  // 添加渐变效果（通过多层半透明矩形模拟）
  progressBar.fillStyle(0xffffff, 0.2);
  progressBar.fillRect(
    barConfig.x,
    barConfig.y,
    progressWidth,
    barConfig.height / 2
  );
}

// 创建游戏实例
const game = new Phaser.Game(config);