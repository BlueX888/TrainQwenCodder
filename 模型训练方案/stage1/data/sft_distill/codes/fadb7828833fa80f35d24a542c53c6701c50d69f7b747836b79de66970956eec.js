const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let currentProgress = 0;
const maxProgress = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = 400;
  const centerY = 300;
  const barWidth = 600;
  const barHeight = 50;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;

  // 创建进度条背景
  const bgGraphics = this.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRoundedRect(barX, barY, barWidth, barHeight, 10);

  // 创建进度条前景（粉色）
  const progressGraphics = this.add.graphics();

  // 创建进度文本
  const progressText = this.add.text(centerX, centerY, '0 / 20', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  progressText.setOrigin(0.5);

  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(centerX, centerY + 80, '完成！', {
    fontSize: '48px',
    color: '#ff69b4',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);

  // 更新进度条的函数
  const updateProgressBar = () => {
    // 清除之前的绘制
    progressGraphics.clear();
    
    // 计算当前进度的宽度
    const fillWidth = (currentProgress / maxProgress) * barWidth;
    
    // 绘制粉色进度条
    progressGraphics.fillStyle(0xff69b4, 1);
    progressGraphics.fillRoundedRect(barX, barY, fillWidth, barHeight, 10);
    
    // 更新进度文本
    progressText.setText(`${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      completeText.setVisible(true);
      // 停止计时器
      if (this.progressTimer) {
        this.progressTimer.remove();
      }
    }
  };

  // 初始绘制
  updateProgressBar();

  // 创建计时器，每秒增加1点进度
  this.progressTimer = this.time.addEvent({
    delay: 1000, // 1秒
    callback: () => {
      if (currentProgress < maxProgress) {
        currentProgress++;
        updateProgressBar();
      }
    },
    callbackScope: this,
    loop: true
  });

  // 添加标题文本
  const titleText = this.add.text(centerX, 150, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 添加说明文本
  const infoText = this.add.text(centerX, 450, '每秒自动增加 1 点进度', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);