const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 全局状态变量（可验证）
let currentProgress = 0;
const maxProgress = 3;
let isCompleted = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 400;
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
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);

  // 创建进度条前景（蓝色）
  const progressGraphics = this.add.graphics();

  // 创建进度文本
  const progressText = this.add.text(centerX, centerY - 80, 'Progress: 0 / 3', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  progressText.setOrigin(0.5);

  // 创建完成提示文本（初始隐藏）
  const completeText = this.add.text(centerX, centerY + 80, 'COMPLETED!', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold',
    align: 'center'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 更新进度条的函数
  const updateProgressBar = () => {
    // 清除之前的绘制
    progressGraphics.clear();
    
    // 计算当前进度的宽度
    const progressRatio = currentProgress / maxProgress;
    const currentWidth = barWidth * progressRatio;
    
    // 绘制蓝色进度条
    progressGraphics.fillStyle(0x0099ff, 1);
    progressGraphics.fillRect(barX, barY, currentWidth, barHeight);
    
    // 更新文本
    progressText.setText(`Progress: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress && !isCompleted) {
      isCompleted = true;
      completeText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        duration: 300,
        repeat: 2
      });
    }
  };

  // 初始化进度条显示
  updateProgressBar();

  // 创建定时器，每秒增加进度
  const progressTimer = this.time.addEvent({
    delay: 1000, // 1秒
    callback: () => {
      if (currentProgress < maxProgress) {
        currentProgress++;
        updateProgressBar();
        
        console.log(`Progress updated: ${currentProgress}/${maxProgress}`);
      }
      
      // 达到最大值时停止定时器
      if (currentProgress >= maxProgress) {
        progressTimer.destroy();
        console.log('Progress complete! Timer stopped.');
      }
    },
    callbackScope: this,
    loop: true
  });

  // 添加调试信息文本
  const debugText = this.add.text(10, 10, 'Debug Info:', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#cccccc'
  });

  // 更新调试信息
  this.time.addEvent({
    delay: 100,
    callback: () => {
      debugText.setText([
        'Debug Info:',
        `Current Progress: ${currentProgress}`,
        `Max Progress: ${maxProgress}`,
        `Is Completed: ${isCompleted}`,
        `Timer Active: ${progressTimer.paused ? 'No' : 'Yes'}`
      ]);
    },
    loop: true
  });

  // 添加重置按钮（用于测试）
  const resetButton = this.add.text(centerX, 550, '[Click to Reset]', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffff00',
    align: 'center'
  });
  resetButton.setOrigin(0.5);
  resetButton.setInteractive({ useHandCursor: true });
  
  resetButton.on('pointerdown', () => {
    // 重置所有状态
    currentProgress = 0;
    isCompleted = false;
    completeText.setVisible(false);
    updateProgressBar();
    
    // 重启定时器
    if (progressTimer.paused) {
      progressTimer.paused = false;
    }
    progressTimer.reset({
      delay: 1000,
      callback: progressTimer.callback,
      callbackScope: this,
      loop: true
    });
    
    console.log('Progress reset!');
  });
}

new Phaser.Game(config);