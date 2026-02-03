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

// 可验证的状态变量
let currentProgress = 0;
const maxProgress = 3;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const barX = 200;
  const barY = 280;
  const barWidth = 400;
  const barHeight = 40;
  const borderWidth = 4;
  
  // 创建进度条背景（边框）
  const barBorder = this.add.graphics();
  barBorder.lineStyle(borderWidth, 0xffffff, 1);
  barBorder.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条背景（灰色填充）
  const barBackground = this.add.graphics();
  barBackground.fillStyle(0x555555, 1);
  barBackground.fillRect(
    barX + borderWidth, 
    barY + borderWidth, 
    barWidth - borderWidth * 2, 
    barHeight - borderWidth * 2
  );
  
  // 创建进度条前景（红色）
  const barForeground = this.add.graphics();
  
  // 创建进度文本
  const progressText = this.add.text(400, 240, '0/3', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 350, '完成！', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  function updateProgressBar() {
    // 清除之前的绘制
    barForeground.clear();
    
    // 计算进度比例
    const progress = currentProgress / maxProgress;
    const fillWidth = (barWidth - borderWidth * 2) * progress;
    
    // 绘制红色进度条
    barForeground.fillStyle(0xff0000, 1);
    barForeground.fillRect(
      barX + borderWidth,
      barY + borderWidth,
      fillWidth,
      barHeight - borderWidth * 2
    );
    
    // 更新文本
    progressText.setText(`${currentProgress}/${maxProgress}`);
  }
  
  // 初始绘制
  updateProgressBar();
  
  // 创建定时器事件，每秒增加进度
  const timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: function() {
      // 增加进度
      currentProgress++;
      
      // 更新进度条显示
      updateProgressBar();
      
      // 检查是否完成
      if (currentProgress >= maxProgress) {
        // 停止定时器
        timerEvent.remove();
        
        // 显示完成文本
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
        
        console.log('Progress complete!', currentProgress);
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加标题文本
  const titleText = this.add.text(400, 150, '进度条演示', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  titleText.setOrigin(0.5);
  
  // 添加说明文本
  const infoText = this.add.text(400, 450, '进度每秒增加1，从0到3', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);