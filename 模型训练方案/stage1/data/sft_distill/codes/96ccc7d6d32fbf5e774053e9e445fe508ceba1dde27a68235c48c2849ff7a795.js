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

// 全局信号对象，用于验证状态
window.__signals__ = {
  progress: 0,
  completed: false,
  logs: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const progressBarConfig = {
    x: 200,
    y: 280,
    width: 400,
    height: 40,
    maxValue: 12,
    currentValue: 0
  };
  
  // 创建进度条背景（深灰色）
  const background = scene.add.graphics();
  background.fillStyle(0x222222, 1);
  background.fillRect(
    progressBarConfig.x,
    progressBarConfig.y,
    progressBarConfig.width,
    progressBarConfig.height
  );
  
  // 创建进度条边框（白色）
  const border = scene.add.graphics();
  border.lineStyle(3, 0xffffff, 1);
  border.strokeRect(
    progressBarConfig.x,
    progressBarConfig.y,
    progressBarConfig.width,
    progressBarConfig.height
  );
  
  // 创建进度条前景（红色）
  const progressBar = scene.add.graphics();
  
  // 创建进度文本
  const progressText = scene.add.text(
    400,
    250,
    'Progress: 0 / 12',
    {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }
  );
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completedText = scene.add.text(
    400,
    350,
    '✓ COMPLETED!',
    {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }
  );
  completedText.setOrigin(0.5);
  completedText.setVisible(false);
  
  // 更新进度条的函数
  function updateProgressBar(value) {
    progressBar.clear();
    
    if (value > 0) {
      // 计算进度条宽度
      const fillWidth = (value / progressBarConfig.maxValue) * progressBarConfig.width;
      
      // 绘制红色进度条
      progressBar.fillStyle(0xff0000, 1);
      progressBar.fillRect(
        progressBarConfig.x,
        progressBarConfig.y,
        fillWidth,
        progressBarConfig.height
      );
    }
    
    // 更新文本
    progressText.setText(`Progress: ${value} / ${progressBarConfig.maxValue}`);
    
    // 更新全局信号
    window.__signals__.progress = value;
    window.__signals__.logs.push({
      timestamp: Date.now(),
      progress: value,
      percentage: (value / progressBarConfig.maxValue * 100).toFixed(1) + '%'
    });
    
    console.log(`[Progress Update] ${value}/${progressBarConfig.maxValue} (${(value / progressBarConfig.maxValue * 100).toFixed(1)}%)`);
  }
  
  // 初始化进度条
  updateProgressBar(0);
  
  // 创建定时器事件，每秒增加1
  const timerEvent = scene.time.addEvent({
    delay: 1000,                    // 1秒
    callback: onTimerTick,
    callbackScope: scene,
    loop: true
  });
  
  function onTimerTick() {
    // 增加进度值
    progressBarConfig.currentValue++;
    
    // 更新进度条显示
    updateProgressBar(progressBarConfig.currentValue);
    
    // 检查是否完成
    if (progressBarConfig.currentValue >= progressBarConfig.maxValue) {
      // 停止计时器
      timerEvent.remove();
      
      // 显示完成文字
      completedText.setVisible(true);
      
      // 添加完成动画效果
      scene.tweens.add({
        targets: completedText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          completedText.setScale(1);
        }
      });
      
      // 更新全局信号
      window.__signals__.completed = true;
      window.__signals__.logs.push({
        timestamp: Date.now(),
        event: 'COMPLETED',
        finalProgress: progressBarConfig.currentValue
      });
      
      console.log('[Progress Bar] COMPLETED!');
      console.log(JSON.stringify(window.__signals__, null, 2));
    }
  }
  
  // 添加说明文字
  const instructionText = scene.add.text(
    400,
    500,
    'Progress bar fills automatically (1 per second)',
    {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }
  );
  instructionText.setOrigin(0.5);
}

new Phaser.Game(config);