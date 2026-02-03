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
  
  // 创建进度条背景
  const bgGraphics = scene.add.graphics();
  bgGraphics.fillStyle(0x333333, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = scene.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（蓝色）
  const progressGraphics = scene.add.graphics();
  
  // 创建进度文本
  const progressText = scene.add.text(400, 240, 'Progress: 0 / 20', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = scene.add.text(400, 350, 'COMPLETE!', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  function updateProgressBar() {
    progressGraphics.clear();
    
    // 计算当前进度条宽度
    const currentWidth = (progress / maxProgress) * barWidth;
    
    // 绘制蓝色进度条
    progressGraphics.fillStyle(0x0088ff, 1);
    progressGraphics.fillRect(barX, barY, currentWidth, barHeight);
    
    // 更新文本
    progressText.setText(`Progress: ${progress} / ${maxProgress}`);
  }
  
  // 初始绘制
  updateProgressBar();
  
  // 创建定时器事件，每秒增加1
  const timerEvent = scene.time.addEvent({
    delay: 1000,                    // 1秒
    callback: () => {
      progress++;
      updateProgressBar();
      
      // 检查是否完成
      if (progress >= maxProgress) {
        timerEvent.remove();        // 停止计时器
        completeText.setVisible(true);
        
        // 添加完成动画效果
        scene.tweens.add({
          targets: completeText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });
        
        console.log('Progress bar completed!');
      }
    },
    callbackScope: scene,
    loop: true                      // 循环执行
  });
  
  // 添加调试信息
  const debugText = scene.add.text(10, 10, 'Timer running...', {
    fontSize: '16px',
    color: '#888888',
    fontFamily: 'Arial'
  });
  
  // 存储引用以便在 update 中访问
  scene.debugText = debugText;
  scene.timerEvent = timerEvent;
}

function update(time, delta) {
  // 更新调试信息显示当前进度
  if (this.debugText) {
    if (progress >= maxProgress) {
      this.debugText.setText('Timer stopped - Complete!');
    } else {
      this.debugText.setText(`Timer running... Progress: ${progress}/${maxProgress}`);
    }
  }
}

new Phaser.Game(config);