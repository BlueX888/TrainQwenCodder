const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 初始化验证信号
window.__signals__ = {
  objects: [],
  animationStarted: false,
  animationCompleted: false,
  completedCount: 0,
  timestamp: {
    start: 0,
    end: 0
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  const scene = this;
  
  // 创建3个不同颜色的圆形物体
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];
  
  const objects = [];
  
  // 创建物体
  for (let i = 0; i < 3; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 40);
    
    // 生成纹理
    const textureName = `circle${i}`;
    graphics.generateTexture(textureName, 80, 80);
    graphics.destroy();
    
    // 创建精灵
    const sprite = scene.add.sprite(positions[i].x, positions[i].y, textureName);
    sprite.setData('id', i);
    sprite.setData('originalX', positions[i].x);
    sprite.setData('originalY', positions[i].y);
    
    objects.push(sprite);
    
    // 记录初始状态
    window.__signals__.objects.push({
      id: i,
      color: colors[i],
      originalPosition: { ...positions[i] },
      currentPosition: { x: sprite.x, y: sprite.y },
      isShaking: false
    });
  }
  
  // 记录动画开始时间
  window.__signals__.animationStarted = true;
  window.__signals__.timestamp.start = Date.now();
  
  console.log(JSON.stringify({
    event: 'animation_start',
    objectCount: 3,
    duration: 2000,
    timestamp: window.__signals__.timestamp.start
  }));
  
  // 为每个物体创建抖动动画
  objects.forEach((sprite, index) => {
    const originalX = sprite.getData('originalX');
    const originalY = sprite.getData('originalY');
    
    // 更新状态
    window.__signals__.objects[index].isShaking = true;
    
    // 创建抖动Tween
    const shakeTween = scene.tweens.add({
      targets: sprite,
      x: {
        from: originalX,
        to: originalX + Phaser.Math.Between(-10, 10)
      },
      y: {
        from: originalY,
        to: originalY + Phaser.Math.Between(-10, 10)
      },
      duration: 50, // 每次抖动50ms
      yoyo: true,
      repeat: 19, // 重复19次，总共40次变化 = 2000ms
      ease: 'Sine.easeInOut',
      onUpdate: function() {
        // 更新当前位置
        window.__signals__.objects[index].currentPosition = {
          x: sprite.x,
          y: sprite.y
        };
      },
      onComplete: function() {
        // 恢复到原始位置
        sprite.x = originalX;
        sprite.y = originalY;
        
        // 更新状态
        window.__signals__.objects[index].isShaking = false;
        window.__signals__.objects[index].currentPosition = {
          x: originalX,
          y: originalY
        };
        window.__signals__.completedCount++;
        
        console.log(JSON.stringify({
          event: 'object_shake_complete',
          objectId: index,
          completedCount: window.__signals__.completedCount,
          timestamp: Date.now()
        }));
        
        // 检查是否所有物体都完成
        if (window.__signals__.completedCount === 3) {
          window.__signals__.animationCompleted = true;
          window.__signals__.timestamp.end = Date.now();
          
          const duration = window.__signals__.timestamp.end - window.__signals__.timestamp.start;
          
          console.log(JSON.stringify({
            event: 'all_animations_complete',
            totalDuration: duration,
            expectedDuration: 2000,
            objectCount: 3,
            timestamp: window.__signals__.timestamp.end
          }));
        }
      }
    });
  });
  
  // 添加文本提示
  const text = scene.add.text(400, 100, '3个物体同步抖动中...', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 2秒后更新文本
  scene.time.delayedCall(2000, () => {
    text.setText('抖动动画已完成！');
  });
}

function update(time, delta) {
  // 本示例不需要update逻辑
}

new Phaser.Game(config);