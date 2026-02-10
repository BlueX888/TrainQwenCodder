const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  objectsCount: 0,
  animationsStarted: false,
  animationsCompleted: false,
  rotationValues: [],
  timestamp: Date.now()
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const objects = [];
  const startX = 100;
  const startY = 300;
  const spacing = 70;
  
  // 创建10个圆形物体
  for (let i = 0; i < 10; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00 + i * 0x001100, 1); // 渐变色
    graphics.fillCircle(0, 0, 25);
    
    // 设置位置
    graphics.x = startX + i * spacing;
    graphics.y = startY;
    
    objects.push(graphics);
  }
  
  // 更新信号
  window.__signals__.objectsCount = objects.length;
  window.__signals__.animationsStarted = true;
  
  console.log(JSON.stringify({
    event: 'objects_created',
    count: objects.length,
    timestamp: Date.now()
  }));
  
  // 为每个物体创建旋转动画
  const tweens = [];
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      angle: 360, // 旋转360度
      duration: 1000, // 持续1秒
      ease: 'Linear',
      onUpdate: (tween, target) => {
        // 记录旋转值
        window.__signals__.rotationValues[index] = target.angle;
      },
      onComplete: () => {
        // 记录完成状态
        console.log(JSON.stringify({
          event: 'animation_complete',
          objectIndex: index,
          finalAngle: obj.angle,
          timestamp: Date.now()
        }));
      }
    });
    tweens.push(tween);
  });
  
  // 监听所有动画完成
  let completedCount = 0;
  tweens.forEach((tween) => {
    tween.on('complete', () => {
      completedCount++;
      if (completedCount === 10) {
        window.__signals__.animationsCompleted = true;
        window.__signals__.timestamp = Date.now();
        
        console.log(JSON.stringify({
          event: 'all_animations_complete',
          totalObjects: 10,
          finalRotations: window.__signals__.rotationValues,
          timestamp: Date.now()
        }));
      }
    });
  });
  
  // 添加文本提示
  const text = this.add.text(300, 50, 'Rotating 10 objects...', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 1秒后更新文本
  this.time.delayedCall(1000, () => {
    text.setText('Animation Complete!');
    console.log(JSON.stringify({
      event: 'status_update',
      message: 'All rotations finished',
      timestamp: Date.now()
    }));
  });
}

function update(time, delta) {
  // 更新时间戳
  window.__signals__.timestamp = time;
}

new Phaser.Game(config);