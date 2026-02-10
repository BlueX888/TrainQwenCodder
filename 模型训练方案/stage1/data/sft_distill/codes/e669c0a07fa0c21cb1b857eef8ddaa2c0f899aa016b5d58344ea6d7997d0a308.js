const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let currentProgress = 0;
const maxProgress = 3;
let progressBar = null;
let progressText = null;
let completeText = null;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;
  
  // 进度条尺寸
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
  
  // 创建进度条前景（粉色）
  progressBar = this.add.graphics();
  
  // 显示进度数值文字
  progressText = this.add.text(centerX, barY - 40, `进度: ${currentProgress} / ${maxProgress}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 完成文字（初始隐藏）
  completeText = this.add.text(centerX, barY + barHeight + 50, '✓ 完成！', {
    fontSize: '32px',
    color: '#ff69b4',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 绘制初始进度条
  updateProgressBar(this, barX, barY, barWidth, barHeight);
  
  // 创建定时器事件，每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000, // 1秒
    callback: onProgressUpdate,
    callbackScope: this,
    loop: true,
    args: [barX, barY, barWidth, barHeight]
  });
}

function onProgressUpdate(barX, barY, barWidth, barHeight) {
  if (currentProgress < maxProgress) {
    currentProgress++;
    
    // 更新进度条显示
    updateProgressBar(this, barX, barY, barWidth, barHeight);
    
    // 更新进度文字
    progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      completeText.setVisible(true);
      
      // 停止计时器
      if (timerEvent) {
        timerEvent.remove();
      }
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.easeOut'
      });
    }
  }
}

function updateProgressBar(scene, barX, barY, barWidth, barHeight) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressRatio = currentProgress / maxProgress;
  const currentWidth = barWidth * progressRatio;
  
  // 绘制粉色进度条
  progressBar.fillStyle(0xff69b4, 1); // 粉色
  progressBar.fillRect(barX, barY, currentWidth, barHeight);
  
  // 添加渐变效果（通过叠加半透明白色）
  if (currentWidth > 0) {
    progressBar.fillStyle(0xffffff, 0.3);
    progressBar.fillRect(barX, barY, currentWidth, barHeight / 2);
  }
}

function update(time, delta) {
  // 可以在这里添加额外的动画效果
  // 例如让进度条有脉动效果
  if (currentProgress < maxProgress && progressBar) {
    const pulse = Math.sin(time * 0.003) * 0.1 + 0.9;
    progressBar.setAlpha(pulse);
  } else if (progressBar) {
    progressBar.setAlpha(1);
  }
}

// 启动游戏
new Phaser.Game(config);