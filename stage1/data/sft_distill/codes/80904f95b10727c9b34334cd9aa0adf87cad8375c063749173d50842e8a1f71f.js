const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  objectsCreated: 0,
  animationsStarted: 0,
  animationsCompleted: 0,
  rotationValues: [],
  status: 'initializing'
};

function preload() {
  // 无需预加载外部资源
  window.__signals__.status = 'preloading';
}

function create() {
  window.__signals__.status = 'creating';
  
  const objects = [];
  const colors = [
    0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF,
    0x00FFFF, 0xFF8800, 0x8800FF, 0x00FF88, 0xFF0088
  ];
  
  // 创建10个物体，排列成两行
  for (let i = 0; i < 10; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(-25, -25, 50, 50); // 以中心点为原点绘制
    
    // 计算位置：两行排列
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 150 + col * 120;
    const y = 200 + row * 200;
    
    graphics.setPosition(x, y);
    objects.push(graphics);
    
    window.__signals__.objectsCreated++;
  }
  
  console.log(JSON.stringify({
    event: 'objects_created',
    count: window.__signals__.objectsCreated
  }));
  
  // 为所有物体添加同步旋转动画
  const tweens = [];
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      angle: 360, // 旋转360度
      duration: 1000, // 持续1秒
      ease: 'Linear',
      onStart: () => {
        window.__signals__.animationsStarted++;
        if (window.__signals__.animationsStarted === 1) {
          window.__signals__.status = 'animating';
          console.log(JSON.stringify({
            event: 'animation_started',
            timestamp: Date.now()
          }));
        }
      },
      onUpdate: (tween, target) => {
        // 记录每个物体的旋转值
        window.__signals__.rotationValues[index] = target.angle;
      },
      onComplete: () => {
        window.__signals__.animationsCompleted++;
        
        console.log(JSON.stringify({
          event: 'animation_completed',
          objectIndex: index,
          finalAngle: obj.angle,
          totalCompleted: window.__signals__.animationsCompleted
        }));
        
        // 当所有动画完成时
        if (window.__signals__.animationsCompleted === 10) {
          window.__signals__.status = 'completed';
          console.log(JSON.stringify({
            event: 'all_animations_completed',
            totalObjects: window.__signals__.objectsCreated,
            totalAnimations: window.__signals__.animationsCompleted,
            finalRotations: window.__signals__.rotationValues,
            timestamp: Date.now()
          }));
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加文本提示
  const text = this.add.text(400, 50, 'Rotating 10 objects for 1 second...', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 1秒后更新文本
  this.time.delayedCall(1000, () => {
    text.setText('Rotation Complete!');
  });
}

function update(time, delta) {
  // 每帧更新逻辑（可选）
  // 在这里可以添加额外的状态检查
}

new Phaser.Game(config);