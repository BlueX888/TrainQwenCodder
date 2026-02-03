const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态变量
let progress = 0;
let isCompleted = false;

// UI 元素引用
let progressBarBg;
let progressBarFill;
let progressText;
let completedText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条配置
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（灰色）
  progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x555555, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  progressBarBg.lineStyle(2, 0x333333, 1);
  progressBarBg.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（蓝色）
  progressBarFill = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, centerY - 80, '进度: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completedText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 添加说明文本
  this.add.text(centerX, 50, '进度条演示：每秒增加1，满3后完成', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 创建计时器事件：每秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: onTimerTick,
    callbackScope: this,
    loop: true
  });
  
  // 初始化进度条
  updateProgressBar(barX, barY, barWidth, barHeight);
}

function onTimerTick() {
  if (progress < 3) {
    progress++;
    console.log(`Progress updated: ${progress}/3`);
    
    // 更新进度文本
    progressText.setText(`进度: ${progress} / 3`);
    
    // 检查是否完成
    if (progress >= 3) {
      isCompleted = true;
      completedText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      console.log('Progress completed!');
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completedText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 2
      });
    }
  }
}

function updateProgressBar(barX, barY, barWidth, barHeight) {
  // 清除之前的填充
  progressBarFill.clear();
  
  // 计算当前进度百分比
  const progressPercent = progress / 3;
  const fillWidth = barWidth * progressPercent;
  
  // 绘制蓝色进度条
  if (fillWidth > 0) {
    progressBarFill.fillStyle(0x0088ff, 1);
    progressBarFill.fillRect(barX, barY, fillWidth, barHeight);
  }
}

function update(time, delta) {
  // 每帧更新进度条显示
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  const barWidth = 400;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  updateProgressBar(barX, barY, barWidth, barHeight);
}

// 启动游戏
new Phaser.Game(config);