const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationComplete = false;
let objects = [];
let tweens = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建8个圆形物体，排列成2行4列
  const cols = 4;
  const rows = 2;
  const spacing = 150;
  const startX = 200;
  const startY = 200;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      // 使用Graphics绘制圆形
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillCircle(0, 0, 40);
      graphics.x = x;
      graphics.y = y;
      
      // 添加文字标识
      const text = scene.add.text(x, y, `${row * cols + col + 1}`, {
        fontSize: '20px',
        color: '#000000'
      });
      text.setOrigin(0.5);
      
      objects.push({ graphics, text });
    }
  }
  
  // 创建同步的淡入淡出动画
  objects.forEach((obj, index) => {
    // 为graphics创建tween
    const graphicsTween = scene.tweens.add({
      targets: obj.graphics,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true, // 淡出后再淡入
      repeat: 0, // 只执行一次完整的淡入淡出循环
      onComplete: () => {
        // 只在最后一个物体完成时设置状态
        if (index === objects.length - 1) {
          animationComplete = true;
          console.log('Animation completed! All objects faded in and out.');
        }
      }
    });
    
    // 为text创建tween（与graphics同步）
    const textTween = scene.tweens.add({
      targets: obj.text,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: 0
    });
    
    tweens.push(graphicsTween, textTween);
  });
  
  // 添加状态显示文本
  const statusText = scene.add.text(400, 50, 'Animation Status: Running', {
    fontSize: '24px',
    color: '#ffffff'
  });
  statusText.setOrigin(0.5);
  
  // 添加计时器文本
  const timerText = scene.add.text(400, 100, 'Time: 0.00s', {
    fontSize: '20px',
    color: '#ffffff'
  });
  timerText.setOrigin(0.5);
  
  // 存储到scene以便update访问
  scene.statusText = statusText;
  scene.timerText = timerText;
  scene.startTime = scene.time.now;
}

function update(time, delta) {
  // 更新计时器显示
  const elapsed = (time - this.startTime) / 1000;
  this.timerText.setText(`Time: ${elapsed.toFixed(2)}s`);
  
  // 更新状态显示
  if (animationComplete) {
    this.statusText.setText('Animation Status: Completed');
    this.statusText.setColor('#00ff00');
  }
  
  // 验证：在1秒后检查动画是否完成
  if (elapsed >= 1.0 && animationComplete) {
    console.log('Verification: Animation completed exactly after 1 second cycle');
  }
}

const game = new Phaser.Game(config);