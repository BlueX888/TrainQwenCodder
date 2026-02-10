const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let currentProgress = 0;
const maxProgress = 12;

function preload() {
  // 无需加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条尺寸和位置
  const barX = 200;
  const barY = 280;
  const barWidth = 400;
  const barHeight = 40;
  const borderWidth = 4;
  
  // 创建进度条边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(borderWidth, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条背景
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x444444, 1);
  bgGraphics.fillRect(barX + borderWidth, barY + borderWidth, barWidth - borderWidth * 2, barHeight - borderWidth * 2);
  
  // 创建进度条前景（青色）
  const progressGraphics = this.add.graphics();
  
  // 创建进度文本
  const progressText = this.add.text(400, 250, '0 / 12', {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 350, '完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  function updateProgressBar() {
    // 清除之前的绘制
    progressGraphics.clear();
    
    // 计算当前进度宽度
    const progressWidth = ((barWidth - borderWidth * 2) / maxProgress) * currentProgress;
    
    // 绘制青色进度条
    progressGraphics.fillStyle(0x00ffff, 1);
    progressGraphics.fillRect(
      barX + borderWidth,
      barY + borderWidth,
      progressWidth,
      barHeight - borderWidth * 2
    );
    
    // 更新进度文本
    progressText.setText(`${currentProgress} / ${maxProgress}`);
  }
  
  // 初始绘制
  updateProgressBar();
  
  // 创建定时器事件，每秒增加1
  const timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: function() {
      currentProgress++;
      updateProgressBar();
      
      // 检查是否完成
      if (currentProgress >= maxProgress) {
        // 停止定时器
        timerEvent.remove();
        
        // 显示完成文本
        completeText.setVisible(true);
        
        // 添加完成文本的缩放动画
        scene.tweens.add({
          targets: completeText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });
        
        console.log('进度条已完成！');
      }
    },
    callbackScope: this,
    loop: true                  // 循环执行
  });
  
  // 添加标题文本
  const titleText = this.add.text(400, 150, '进度条演示', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);
  
  // 添加说明文本
  const infoText = this.add.text(400, 450, '进度每秒自动增加 1', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 创建游戏实例
new Phaser.Game(config);