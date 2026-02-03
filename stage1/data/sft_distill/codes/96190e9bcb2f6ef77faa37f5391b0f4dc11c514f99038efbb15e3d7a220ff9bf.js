const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 12;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 进度条位置和尺寸
  const barX = 200;
  const barY = 280;
  const barWidth = 400;
  const barHeight = 40;
  
  // 创建进度条背景
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x333333, 1);
  bgGraphics.fillRoundedRect(barX, barY, barWidth, barHeight, 10);
  bgGraphics.lineStyle(2, 0x666666, 1);
  bgGraphics.strokeRoundedRect(barX, barY, barWidth, barHeight, 10);
  
  // 创建进度条前景（青色）
  const progressGraphics = this.add.graphics();
  
  // 创建标题文本
  const titleText = this.add.text(400, 220, 'Progress Bar Demo', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度数值文本
  const progressText = this.add.text(400, barY + barHeight / 2, `${progress} / ${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 380, 'COMPLETE!', {
    fontSize: '48px',
    color: '#00ffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  const updateProgressBar = () => {
    // 清除之前的绘制
    progressGraphics.clear();
    
    // 计算当前进度宽度
    const currentWidth = (progress / maxProgress) * (barWidth - 8);
    
    // 绘制青色进度条
    progressGraphics.fillStyle(0x00ffff, 1);
    progressGraphics.fillRoundedRect(barX + 4, barY + 4, currentWidth, barHeight - 8, 8);
    
    // 添加发光效果
    progressGraphics.fillStyle(0x00ffff, 0.3);
    progressGraphics.fillRoundedRect(barX + 4, barY + 4, currentWidth, barHeight - 8, 8);
    
    // 更新文本
    progressText.setText(`${progress} / ${maxProgress}`);
  };
  
  // 初始绘制
  updateProgressBar();
  
  // 创建定时器事件，每秒增加进度
  const timerEvent = this.time.addEvent({
    delay: 1000,                    // 每1000毫秒（1秒）
    callback: () => {
      if (progress < maxProgress) {
        progress++;
        updateProgressBar();
        
        console.log(`Progress: ${progress}/${maxProgress}`);
        
        // 检查是否完成
        if (progress >= maxProgress) {
          completeText.setVisible(true);
          
          // 添加完成文本的闪烁效果
          this.tweens.add({
            targets: completeText,
            alpha: { from: 1, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1
          });
          
          console.log('Progress Complete!');
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
  
  // 添加说明文本
  const infoText = this.add.text(400, 500, 'Progress increases by 1 every second', {
    fontSize: '18px',
    color: '#888888',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
}

function update(time, delta) {
  // 本例中不需要每帧更新逻辑
}

new Phaser.Game(config);