const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 可验证的状态信号
let currentProgress = 0;
let isCompleted = false;

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
  const bgGraphics = scene.add.graphics();
  bgGraphics.fillStyle(0x555555, 1);
  bgGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色）
  const progressGraphics = scene.add.graphics();
  
  // 创建进度文本
  const progressText = scene.add.text(400, 240, 'Progress: 0 / 3', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  const completeText = scene.add.text(400, 350, '✓ 完成！', {
    fontSize: '32px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 存储到 scene 数据中以便在 update 中访问
  scene.data.set('progressGraphics', progressGraphics);
  scene.data.set('progressText', progressText);
  scene.data.set('completeText', completeText);
  scene.data.set('barConfig', { x: barX, y: barY, width: barWidth, height: barHeight });
  scene.data.set('currentProgress', 0);
  scene.data.set('maxProgress', 3);
  
  // 创建计时器事件：每秒增加进度
  const timerEvent = scene.time.addEvent({
    delay: 1000,           // 每1000毫秒（1秒）
    callback: updateProgress,
    callbackScope: scene,
    repeat: 2,             // 重复2次（总共执行3次：0->1, 1->2, 2->3）
    startAt: 0
  });
  
  scene.data.set('timerEvent', timerEvent);
}

function updateProgress() {
  const scene = this;
  let progress = scene.data.get('currentProgress');
  const maxProgress = scene.data.get('maxProgress');
  
  // 增加进度
  progress++;
  scene.data.set('currentProgress', progress);
  currentProgress = progress; // 更新全局状态信号
  
  // 更新进度文本
  const progressText = scene.data.get('progressText');
  progressText.setText(`Progress: ${progress} / ${maxProgress}`);
  
  // 检查是否完成
  if (progress >= maxProgress) {
    isCompleted = true; // 更新全局状态信号
    const completeText = scene.data.get('completeText');
    completeText.setVisible(true);
    
    console.log('进度条已完成！');
  }
}

function update(time, delta) {
  const scene = this;
  const progressGraphics = scene.data.get('progressGraphics');
  const barConfig = scene.data.get('barConfig');
  const currentProgress = scene.data.get('currentProgress');
  const maxProgress = scene.data.get('maxProgress');
  
  // 清除之前的绘制
  progressGraphics.clear();
  
  // 计算当前进度宽度
  const progressRatio = currentProgress / maxProgress;
  const currentWidth = barConfig.width * progressRatio;
  
  // 绘制白色进度条
  progressGraphics.fillStyle(0xffffff, 1);
  progressGraphics.fillRect(
    barConfig.x, 
    barConfig.y, 
    currentWidth, 
    barConfig.height
  );
}

new Phaser.Game(config);