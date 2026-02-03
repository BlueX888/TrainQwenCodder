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
const maxProgress = 12;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条配置
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（深灰色）
  const progressBarBg = this.add.graphics();
  progressBarBg.fillStyle(0x222222, 1);
  progressBarBg.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const progressBarBorder = this.add.graphics();
  progressBarBorder.lineStyle(3, 0x00ffff, 1);
  progressBarBorder.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（青色）
  const progressBarFill = this.add.graphics();
  
  // 创建进度文本
  const progressText = this.add.text(centerX, barY - 40, '进度: 0 / 12', {
    fontSize: '24px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  const updateProgressBar = () => {
    // 计算当前进度条宽度
    const fillWidth = (currentProgress / maxProgress) * barWidth;
    
    // 清空并重绘进度条
    progressBarFill.clear();
    progressBarFill.fillStyle(0x00ffff, 1);
    progressBarFill.fillRect(barX, barY, fillWidth, barHeight);
    
    // 更新进度文本
    progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      completeText.setVisible(true);
      
      // 添加完成动画效果
      this.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        duration: 500,
        ease: 'Back.easeOut'
      });
      
      // 进度条闪烁效果
      this.tweens.add({
        targets: progressBarFill,
        alpha: { from: 1, to: 0.6 },
        duration: 300,
        yoyo: true,
        repeat: 3
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
        
        // 打印到控制台便于验证
        console.log(`Progress: ${currentProgress}/${maxProgress}`);
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加说明文本
  const instructionText = this.add.text(centerX, centerY + 150, '进度条将在12秒内自动完成', {
    fontSize: '18px',
    color: '#888888',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
  
  // 添加重置按钮（便于测试）
  const resetButton = this.add.text(centerX, centerY + 200, '[点击重置]', {
    fontSize: '16px',
    color: '#ffff00',
    fontFamily: 'Arial'
  });
  resetButton.setOrigin(0.5);
  resetButton.setInteractive({ useHandCursor: true });
  
  resetButton.on('pointerdown', () => {
    // 重置进度
    currentProgress = 0;
    completeText.setVisible(false);
    updateProgressBar();
    console.log('Progress reset');
  });
  
  resetButton.on('pointerover', () => {
    resetButton.setColor('#ffffff');
  });
  
  resetButton.on('pointerout', () => {
    resetButton.setColor('#ffff00');
  });
}

// 创建游戏实例
new Phaser.Game(config);