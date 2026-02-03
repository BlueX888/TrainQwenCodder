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

// 初始化信号对象
window.__signals__ = {
  objectCount: 0,
  animationStarted: false,
  animationCompleted: false,
  rotationComplete: false,
  startTime: 0,
  endTime: 0,
  duration: 0,
  objects: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const objectCount = 15;
  
  // 计算网格布局（5列3行）
  const cols = 5;
  const rows = 3;
  const startX = 150;
  const startY = 150;
  const spacingX = 120;
  const spacingY = 150;
  
  // 创建15个矩形物体
  for (let i = 0; i < objectCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 使用Graphics绘制矩形
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(-25, -25, 50, 50); // 中心点为(0,0)的50x50矩形
    
    // 添加边框
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeRect(-25, -25, 50, 50);
    
    // 设置位置
    graphics.x = x;
    graphics.y = y;
    
    // 添加文本标签
    const text = scene.add.text(x, y, `${i + 1}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    
    objects.push({ graphics, text, id: i + 1 });
    
    // 记录物体信息
    window.__signals__.objects.push({
      id: i + 1,
      initialRotation: graphics.rotation,
      x: x,
      y: y
    });
  }
  
  window.__signals__.objectCount = objectCount;
  window.__signals__.animationStarted = true;
  window.__signals__.startTime = Date.now();
  
  console.log(JSON.stringify({
    event: 'animation_start',
    objectCount: objectCount,
    timestamp: window.__signals__.startTime
  }));
  
  // 创建同步旋转动画
  const tweens = [];
  
  objects.forEach((obj, index) => {
    // 为每个物体的graphics创建旋转tween
    const tween = scene.tweens.add({
      targets: obj.graphics,
      angle: 360, // 旋转360度
      duration: 500, // 持续0.5秒
      ease: 'Linear',
      onComplete: () => {
        // 记录单个物体完成状态
        window.__signals__.objects[index].finalRotation = obj.graphics.rotation;
        window.__signals__.objects[index].completed = true;
        
        // 检查是否所有物体都完成
        const allCompleted = window.__signals__.objects.every(o => o.completed);
        if (allCompleted && !window.__signals__.animationCompleted) {
          window.__signals__.animationCompleted = true;
          window.__signals__.rotationComplete = true;
          window.__signals__.endTime = Date.now();
          window.__signals__.duration = window.__signals__.endTime - window.__signals__.startTime;
          
          console.log(JSON.stringify({
            event: 'animation_complete',
            objectCount: objectCount,
            duration: window.__signals__.duration,
            timestamp: window.__signals__.endTime
          }));
          
          // 显示完成提示
          const completeText = scene.add.text(400, 50, 'Animation Complete!', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
          });
          completeText.setOrigin(0.5);
          
          // 完成提示闪烁效果
          scene.tweens.add({
            targets: completeText,
            alpha: 0,
            duration: 300,
            yoyo: true,
            repeat: 2
          });
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加标题文本
  const titleText = scene.add.text(400, 30, '15 Objects Synchronized Rotation (0.5s)', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 添加状态显示文本
  const statusText = scene.add.text(400, 570, 'Rotating...', {
    fontSize: '18px',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);
  
  // 0.5秒后更新状态
  scene.time.delayedCall(500, () => {
    statusText.setText('Rotation Stopped');
    statusText.setColor('#00ff00');
  });
  
  // 添加调试信息显示
  const debugText = scene.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#888888'
  });
  
  // 实时更新调试信息
  let elapsed = 0;
  scene.time.addEvent({
    delay: 50,
    callback: () => {
      elapsed += 50;
      if (elapsed <= 500) {
        debugText.setText(`Time: ${elapsed}ms / 500ms`);
      } else {
        debugText.setText(`Time: 500ms / 500ms (Complete)`);
      }
    },
    repeat: 10
  });
}

new Phaser.Game(config);