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
const maxProgress = 5;

function preload() {
  // 无需加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const barWidth = 400;
  const barHeight = 40;
  const barX = 200;
  const barY = 280;
  
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
  
  // 进度文本
  const progressText = this.add.text(400, 250, '进度: 0 / 5', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 完成文本（初始隐藏）
  const completeText = this.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 更新进度条的函数
  function updateProgressBar() {
    // 清除之前的进度条
    progressGraphics.clear();
    
    // 计算当前进度宽度
    const progressWidth = (currentProgress / maxProgress) * barWidth;
    
    // 绘制黄色进度条
    progressGraphics.fillStyle(0xffdd00, 1);
    progressGraphics.fillRect(barX, barY, progressWidth, barHeight);
    
    // 更新文本
    progressText.setText(`进度: ${currentProgress} / ${maxProgress}`);
    
    // 检查是否完成
    if (currentProgress >= maxProgress) {
      completeText.setVisible(true);
      
      // 添加完成动画效果
      scene.tweens.add({
        targets: completeText,
        scale: { from: 0.5, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: 0
      });
    }
  }
  
  // 初始绘制
  updateProgressBar();
  
  // 创建定时器，每秒增加进度
  const timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: () => {
      if (currentProgress < maxProgress) {
        currentProgress++;
        updateProgressBar();
        
        console.log(`进度更新: ${currentProgress}/${maxProgress}`);
      } else {
        // 达到最大值后停止定时器
        timerEvent.remove();
        console.log('进度条已完成！');
      }
    },
    callbackScope: this,
    loop: true
  });
  
  // 添加提示文本
  const hintText = this.add.text(400, 400, '进度每秒自动增加 1', {
    fontSize: '18px',
    color: '#888888',
    fontFamily: 'Arial'
  });
  hintText.setOrigin(0.5);
  
  // 添加标题
  const titleText = this.add.text(400, 150, '进度条演示', {
    fontSize: '36px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);