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

// 全局状态变量，用于验证
let currentProgress = 0;
const maxProgress = 10;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = 100;
  const barY = 250;
  
  // 创建进度条背景（灰色）
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（黄色）
  const progressGraphics = this.add.graphics();
  
  // 创建标题文本
  const titleText = this.add.text(400, 180, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度文本
  const progressText = this.add.text(400, 320, `进度: ${currentProgress}/${maxProgress}`, {
    fontSize: '24px',
    color: '#ffff00',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成提示文本（初始隐藏）
  const completeText = this.add.text(400, 380, '✓ 完成！', {
    fontSize: '28px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  const updateProgressBar = () => {
    // 清除之前的进度条
    progressGraphics.clear();
    
    // 计算当前进度条宽度
    const progressRatio = currentProgress / maxProgress;
    const currentWidth = barWidth * progressRatio;
    
    // 绘制黄色进度条
    progressGraphics.fillStyle(0xffdd00, 1);
    progressGraphics.fillRect(barX, barY, currentWidth, barHeight);
    
    // 更新文本
    progressText.setText(`进度: ${currentProgress}/${maxProgress}`);
    
    // 添加进度百分比显示
    const percentage = Math.round(progressRatio * 100);
    progressText.setText(`进度: ${currentProgress}/${maxProgress} (${percentage}%)`);
  };
  
  // 初始化进度条
  updateProgressBar();
  
  // 创建定时器事件，每秒增加进度
  const timerEvent = this.time.addEvent({
    delay: 1000,                    // 每1000毫秒（1秒）触发一次
    callback: () => {
      // 增加进度
      currentProgress++;
      
      // 更新进度条显示
      updateProgressBar();
      
      // 检查是否完成
      if (currentProgress >= maxProgress) {
        // 停止定时器
        timerEvent.remove();
        
        // 显示完成提示
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
        
        // 在控制台输出完成信息（用于验证）
        console.log('进度条已完成！最终进度:', currentProgress);
      } else {
        // 在控制台输出当前进度（用于验证）
        console.log('当前进度:', currentProgress);
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
  
  // 添加说明文本
  const infoText = this.add.text(400, 500, '进度条每秒自动增加 1，共需 10 秒完成', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
  
  // 添加重置按钮区域（点击屏幕重置）
  const resetText = this.add.text(400, 550, '点击屏幕可重置进度条', {
    fontSize: '16px',
    color: '#888888',
    fontFamily: 'Arial'
  });
  resetText.setOrigin(0.5);
  
  // 点击屏幕重置进度条
  this.input.on('pointerdown', () => {
    // 只有在完成后才允许重置
    if (currentProgress >= maxProgress) {
      currentProgress = 0;
      completeText.setVisible(false);
      updateProgressBar();
      
      // 重新启动定时器
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          currentProgress++;
          updateProgressBar();
          
          if (currentProgress >= maxProgress) {
            completeText.setVisible(true);
            this.tweens.add({
              targets: completeText,
              scaleX: 1.2,
              scaleY: 1.2,
              yoyo: true,
              duration: 300,
              repeat: 2
            });
            console.log('进度条已完成！最终进度:', currentProgress);
          } else {
            console.log('当前进度:', currentProgress);
          }
        },
        callbackScope: this,
        loop: true
      });
      
      console.log('进度条已重置');
    }
  });
}

// 创建游戏实例
new Phaser.Game(config);