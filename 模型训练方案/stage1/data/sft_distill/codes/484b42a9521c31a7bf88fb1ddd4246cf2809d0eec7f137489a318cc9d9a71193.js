const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: 0,
  animationStarted: false,
  animationCompleted: false,
  rotationValues: [],
  timestamp: null
};

function preload() {
  // 无需加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
    0x00ffff, 0xff8800, 0x88ff00, 0x0088ff, 0xff0088
  ];

  // 创建10个物体
  for (let i = 0; i < 10; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(-25, -25, 50, 50); // 中心点为原点的矩形
    
    // 排列成两行，每行5个
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 200 + col * 100;
    const y = 250 + row * 100;
    
    graphics.setPosition(x, y);
    objects.push(graphics);
    
    window.__signals__.objectsCreated++;
  }

  console.log(JSON.stringify({
    event: 'objects_created',
    count: window.__signals__.objectsCreated,
    timestamp: Date.now()
  }));

  // 创建同步旋转动画
  const tweens = [];
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj,
      angle: 360, // 旋转360度
      duration: 1000, // 持续1秒
      ease: 'Linear',
      onStart: () => {
        if (index === 0) {
          window.__signals__.animationStarted = true;
          window.__signals__.timestamp = Date.now();
          console.log(JSON.stringify({
            event: 'animation_started',
            timestamp: window.__signals__.timestamp
          }));
        }
      },
      onUpdate: (tween, target) => {
        // 记录第一个物体的旋转值作为参考
        if (index === 0) {
          window.__signals__.rotationValues.push(target.angle);
        }
      },
      onComplete: () => {
        if (index === 0) {
          window.__signals__.animationCompleted = true;
          const endTime = Date.now();
          const duration = endTime - window.__signals__.timestamp;
          
          console.log(JSON.stringify({
            event: 'animation_completed',
            duration: duration,
            finalAngle: obj.angle,
            timestamp: endTime
          }));
        }
      }
    });
    tweens.push(tween);
  });

  // 存储所有物体和动画引用以便验证
  scene.gameObjects = objects;
  scene.rotationTweens = tweens;
}

function update(time, delta) {
  // 检查动画状态
  if (this.rotationTweens && window.__signals__.animationStarted && !window.__signals__.animationCompleted) {
    // 验证所有物体的旋转角度是否同步
    const angles = this.gameObjects.map(obj => obj.angle);
    const allSynced = angles.every(angle => Math.abs(angle - angles[0]) < 0.1);
    
    if (!allSynced) {
      console.log(JSON.stringify({
        event: 'sync_warning',
        angles: angles,
        timestamp: Date.now()
      }));
    }
  }
  
  // 动画完成后输出最终状态
  if (window.__signals__.animationCompleted && this.gameObjects) {
    const finalAngles = this.gameObjects.map(obj => obj.angle);
    const allCompleted = finalAngles.every(angle => Math.abs(angle - 360) < 1);
    
    if (allCompleted && !window.__signals__.finalReported) {
      window.__signals__.finalReported = true;
      console.log(JSON.stringify({
        event: 'final_state',
        allObjectsAt360: allCompleted,
        finalAngles: finalAngles,
        timestamp: Date.now()
      }));
    }
  }
}

new Phaser.Game(config);