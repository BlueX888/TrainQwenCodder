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

// 初始化信号对象
window.__signals__ = {
  progress: 0,
  maxProgress: 20,
  completed: false,
  logs: []
};

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
  const maxProgress = 20;
  let currentProgress = 0;
  
  // 创建标题文本
  const titleText = this.add.text(400, 200, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度文本
  const progressText = this.add.text(400, 240, `进度: ${currentProgress} / ${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建进度条背景（灰色）
  const backgroundBar = this.add.graphics();
  backgroundBar.fillStyle(0x555555, 1);
  backgroundBar.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderBar = this.add.graphics();
  borderBar.lineStyle(3, 0xffffff, 1);
  borderBar.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（红色）
  const foregroundBar = this.add.graphics();
  
  // 更新进度条的函数
  function updateProgressBar() {
    foregroundBar.clear();
    foregroundBar.fillStyle(0xff0000, 1);
    const progressWidth = (currentProgress / maxProgress) * barWidth;
    foregroundBar.fillRect(barX, barY, progressWidth, barHeight);
  }
  
  // 初始绘制
  updateProgressBar();
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 360, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器，每秒增加进度
  const timer = this.time.addEvent({
    delay: 1000, // 1秒
    callback: function() {
      currentProgress++;
      
      // 更新进度文本
      progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
      
      // 更新进度条
      updateProgressBar();
      
      // 更新信号
      window.__signals__.progress = currentProgress;
      window.__signals__.logs.push({
        time: Date.now(),
        progress: currentProgress,
        message: `进度更新到 ${currentProgress}`
      });
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'progress_update',
        progress: currentProgress,
        maxProgress: maxProgress,
        percentage: (currentProgress / maxProgress * 100).toFixed(1) + '%'
      }));
      
      // 检查是否完成
      if (currentProgress >= maxProgress) {
        // 显示完成文本
        completeText.setVisible(true);
        
        // 添加完成动画（缩放效果）
        scene.tweens.add({
          targets: completeText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });
        
        // 更新信号
        window.__signals__.completed = true;
        window.__signals__.logs.push({
          time: Date.now(),
          progress: currentProgress,
          message: '进度条完成！'
        });
        
        // 输出完成日志
        console.log(JSON.stringify({
          event: 'progress_complete',
          progress: currentProgress,
          completed: true
        }));
        
        // 停止定时器
        timer.remove();
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加说明文本
  const infoText = this.add.text(400, 500, '进度条每秒增加 1，从 0 到 20', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
  
  // 初始化信号日志
  window.__signals__.logs.push({
    time: Date.now(),
    progress: 0,
    message: '进度条初始化'
  });
  
  console.log(JSON.stringify({
    event: 'progress_init',
    progress: 0,
    maxProgress: maxProgress
  }));
}

// 创建游戏实例
new Phaser.Game(config);