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

// 状态变量
let animationActive = true;
let objectsArray = [];
let tweensArray = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建12个物体（3行4列网格布局）
  const rows = 3;
  const cols = 4;
  const spacing = 150;
  const startX = 150;
  const startY = 150;
  const objectRadius = 30;
  
  objectsArray = [];
  tweensArray = [];
  
  // 创建12个圆形物体
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      // 使用Graphics绘制圆形
      const graphics = scene.add.graphics();
      graphics.x = x;
      graphics.y = y;
      
      // 绘制彩色圆形（每个物体颜色略有不同）
      const hue = (row * cols + col) / 12;
      const color = Phaser.Display.Color.HSVToRGB(hue, 0.8, 1);
      const colorValue = Phaser.Display.Color.GetColor(color.r * 255, color.g * 255, color.b * 255);
      
      graphics.fillStyle(colorValue, 1);
      graphics.fillCircle(0, 0, objectRadius);
      
      objectsArray.push(graphics);
      
      // 为每个物体添加淡入淡出动画
      const tween = scene.tweens.add({
        targets: graphics,
        alpha: 0.2, // 淡出到0.2透明度
        duration: 1000, // 1秒淡出
        yoyo: true, // 反向播放（淡入）
        repeat: -1, // 无限循环
        ease: 'Sine.easeInOut'
      });
      
      tweensArray.push(tween);
    }
  }
  
  // 添加状态文本显示
  const statusText = scene.add.text(400, 50, 'Animation Active: true', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setOrigin(0.5);
  
  const timerText = scene.add.text(400, 550, 'Time: 0.0s / 4.0s', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  timerText.setOrigin(0.5);
  
  // 更新计时器显示
  let elapsedTime = 0;
  const timerEvent = scene.time.addEvent({
    delay: 100, // 每100ms更新一次
    callback: () => {
      elapsedTime += 0.1;
      if (elapsedTime <= 4.0) {
        timerText.setText(`Time: ${elapsedTime.toFixed(1)}s / 4.0s`);
      }
    },
    loop: true
  });
  
  // 4秒后停止所有动画
  scene.time.delayedCall(4000, () => {
    // 停止所有tween动画
    tweensArray.forEach(tween => {
      tween.stop();
    });
    
    // 将所有物体的alpha恢复到1（完全不透明）
    objectsArray.forEach(obj => {
      obj.alpha = 1;
    });
    
    // 更新状态变量
    animationActive = false;
    statusText.setText('Animation Active: false');
    statusText.setStyle({ backgroundColor: '#ff0000' });
    
    timerText.setText('Time: 4.0s / 4.0s - STOPPED');
    timerText.setStyle({ backgroundColor: '#ff0000' });
    
    // 停止计时器
    timerEvent.remove();
    
    console.log('Animation stopped after 4 seconds');
    console.log('Final state - animationActive:', animationActive);
    console.log('Total objects:', objectsArray.length);
  });
  
  // 添加说明文字
  const instructionText = scene.add.text(400, 20, 'Watch 12 objects fade in/out synchronously', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  instructionText.setOrigin(0.5);
  
  console.log('Animation started with', objectsArray.length, 'objects');
  console.log('Animation will stop after 4 seconds');
}

new Phaser.Game(config);