const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progressValue = 0;
let isCompleted = false;

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
  const backgroundGraphics = this.add.graphics();
  backgroundGraphics.lineStyle(borderWidth, 0x888888, 1);
  backgroundGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条背景填充（深灰色）
  backgroundGraphics.fillStyle(0x444444, 1);
  backgroundGraphics.fillRect(barX + borderWidth, barY + borderWidth, 
                              barWidth - borderWidth * 2, barHeight - borderWidth * 2);
  
  // 创建进度条前景（红色）
  const progressGraphics = this.add.graphics();
  
  // 创建进度文本
  const progressText = this.add.text(barX + barWidth / 2, barY - 40, 
    '进度: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 400, '完成！', {
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
    
    // 计算当前进度比例
    const progress = progressValue / 3;
    const fillWidth = (barWidth - borderWidth * 2) * progress;
    
    // 绘制红色进度条
    progressGraphics.fillStyle(0xff0000, 1);
    progressGraphics.fillRect(barX + borderWidth, barY + borderWidth, 
                             fillWidth, barHeight - borderWidth * 2);
    
    // 更新进度文本
    progressText.setText(`进度: ${progressValue} / 3`);
    
    // 检查是否完成
    if (progressValue >= 3) {
      isCompleted = true;
      completeText.setVisible(true);
      
      // 添加完成文本的闪烁效果
      scene.tweens.add({
        targets: completeText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  // 初始绘制进度条
  updateProgressBar();
  
  // 创建定时器，每秒增加进度
  const timerEvent = this.time.addEvent({
    delay: 1000,              // 每1000毫秒（1秒）触发一次
    callback: () => {
      if (progressValue < 3) {
        progressValue++;
        updateProgressBar();
        
        console.log(`Progress updated: ${progressValue}/3`);
      } else {
        // 进度达到3时停止计时器
        timerEvent.remove();
        console.log('Progress completed!');
      }
    },
    callbackScope: this,
    loop: true                // 循环执行
  });
  
  // 添加说明文本
  const instructionText = this.add.text(400, 500, 
    '进度条每秒自动增加 1，共需 3 秒完成', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
}

function update(time, delta) {
  // 本示例不需要在 update 中处理逻辑
  // 所有更新通过 TimerEvent 处理
}

// 创建游戏实例
new Phaser.Game(config);