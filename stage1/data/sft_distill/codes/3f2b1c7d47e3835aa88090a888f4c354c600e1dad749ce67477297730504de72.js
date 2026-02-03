const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let progress = 0;
let progressBar = null;
let progressText = null;
let completeText = null;
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 进度条配置
  const barX = 200;
  const barY = 280;
  const barWidth = 400;
  const barHeight = 40;
  const maxProgress = 3;
  
  // 创建进度条背景（灰色）
  const bgGraphics = scene.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条边框
  const borderGraphics = scene.add.graphics();
  borderGraphics.lineStyle(3, 0xffffff, 1);
  borderGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（绿色）
  progressBar = scene.add.graphics();
  
  // 创建标题文本
  const titleText = scene.add.text(400, 200, '进度条演示', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  titleText.setOrigin(0.5);
  
  // 创建进度文本
  progressText = scene.add.text(400, 350, `进度: ${progress} / ${maxProgress}`, {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = scene.add.text(400, 420, '✓ 完成！', {
    fontSize: '36px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器，每秒增加进度
  timerEvent = scene.time.addEvent({
    delay: 1000,                    // 1秒
    callback: onTimerTick,
    callbackScope: scene,
    loop: true
  });
  
  // 定时器回调函数
  function onTimerTick() {
    if (progress < maxProgress) {
      progress++;
      progressText.setText(`进度: ${progress} / ${maxProgress}`);
      
      // 当进度达到最大值时
      if (progress >= maxProgress) {
        completeText.setVisible(true);
        timerEvent.remove(); // 停止计时器
        
        // 添加完成动画效果
        scene.tweens.add({
          targets: completeText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });
      }
    }
  }
  
  // 添加说明文本
  const infoText = scene.add.text(400, 500, '进度每秒自动增加 1', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#888888',
    align: 'center'
  });
  infoText.setOrigin(0.5);
  
  // 存储进度条配置供 update 使用
  scene.barConfig = {
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    maxProgress: maxProgress
  };
}

function update(time, delta) {
  const scene = this;
  const config = scene.barConfig;
  
  // 更新进度条绘制
  if (progressBar && config) {
    progressBar.clear();
    
    // 计算当前进度条宽度
    const progressWidth = (progress / config.maxProgress) * config.width;
    
    // 绘制绿色进度条
    progressBar.fillStyle(0x00ff00, 1);
    progressBar.fillRect(config.x, config.y, progressWidth, config.height);
  }
}

// 创建游戏实例
new Phaser.Game(config);

// 导出状态用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getProgress: () => progress };
}