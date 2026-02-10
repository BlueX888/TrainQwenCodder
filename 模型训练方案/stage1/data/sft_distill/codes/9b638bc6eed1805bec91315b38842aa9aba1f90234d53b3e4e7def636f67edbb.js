const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 初始化全局信号对象
window.__signals__ = {
  objectsCreated: false,
  animationStarted: false,
  animationCompleted: false,
  shakeDuration: 2000,
  objectCount: 3,
  completedObjects: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  // 创建3个图形对象
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 40); // 绘制圆形
    graphics.x = positions[i].x;
    graphics.y = positions[i].y;
    
    // 存储初始位置
    graphics.setData('initialX', positions[i].x);
    graphics.setData('initialY', positions[i].y);
    
    objects.push(graphics);
  }

  window.__signals__.objectsCreated = true;
  window.__signals__.animationStarted = true;

  console.log(JSON.stringify({
    event: 'objects_created',
    count: objects.length,
    timestamp: Date.now()
  }));

  // 为每个物体创建抖动动画
  objects.forEach((obj, index) => {
    const initialX = obj.getData('initialX');
    const initialY = obj.getData('initialY');

    // 创建抖动动画 - 使用多个连续的小幅度移动模拟抖动
    const tween = scene.tweens.add({
      targets: obj,
      x: {
        from: initialX,
        to: initialX + Phaser.Math.Between(-10, 10)
      },
      y: {
        from: initialY,
        to: initialY + Phaser.Math.Between(-10, 10)
      },
      duration: 50, // 每次抖动持续50ms
      yoyo: true,
      repeat: 19, // 重复19次，总共20次循环 = 2000ms
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 动画完成后重置到初始位置
        obj.x = initialX;
        obj.y = initialY;
        
        window.__signals__.completedObjects++;
        
        console.log(JSON.stringify({
          event: 'object_shake_completed',
          objectIndex: index,
          completedCount: window.__signals__.completedObjects,
          timestamp: Date.now()
        }));

        // 所有物体都完成动画
        if (window.__signals__.completedObjects === 3) {
          window.__signals__.animationCompleted = true;
          
          console.log(JSON.stringify({
            event: 'all_animations_completed',
            totalDuration: window.__signals__.shakeDuration,
            objectCount: window.__signals__.objectCount,
            timestamp: Date.now()
          }));
        }
      },
      onUpdate: (tween, target) => {
        // 每次更新时随机调整目标位置，增强抖动效果
        if (tween.progress < 1) {
          const randomX = initialX + Phaser.Math.Between(-10, 10);
          const randomY = initialY + Phaser.Math.Between(-10, 10);
          
          // 通过修改tween的目标值来实现随机抖动
          if (Math.random() > 0.9) { // 10%的概率改变方向
            tween.updateTo('x', randomX, false);
            tween.updateTo('y', randomY, false);
          }
        }
      }
    });
  });

  console.log(JSON.stringify({
    event: 'shake_animation_started',
    duration: 2000,
    objectCount: 3,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 游戏循环更新（本例中不需要特殊逻辑）
}

new Phaser.Game(config);