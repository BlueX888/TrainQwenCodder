const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象，用于验证动画状态
window.__signals__ = {
  animationStarted: false,
  animationCompleted: false,
  objectsCount: 0,
  shakeDuration: 0,
  timestamp: Date.now()
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  
  // 创建3个不同颜色的矩形物体
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const startX = 200;
  const spacing = 200;
  
  for (let i = 0; i < 3; i++) {
    // 使用Graphics绘制矩形
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(-25, -25, 50, 50); // 中心点为原点的50x50矩形
    
    // 设置位置
    graphics.x = startX + i * spacing;
    graphics.y = 300;
    
    objects.push(graphics);
  }
  
  // 更新信号
  window.__signals__.objectsCount = objects.length;
  window.__signals__.animationStarted = true;
  
  console.log(JSON.stringify({
    event: 'animation_start',
    objectsCount: objects.length,
    timestamp: Date.now()
  }));
  
  // 为每个物体创建抖动动画
  const tweens = [];
  const shakeDuration = 2000; // 2秒
  const shakeIntensity = 10; // 抖动幅度
  
  objects.forEach((obj, index) => {
    // 创建X轴抖动
    const tweenX = scene.tweens.add({
      targets: obj,
      x: obj.x + shakeIntensity,
      duration: 50, // 快速抖动，每次50ms
      yoyo: true,
      repeat: Math.floor(shakeDuration / 100) - 1, // 2秒内重复抖动
      ease: 'Sine.easeInOut'
    });
    
    // 创建Y轴抖动（稍微延迟以产生更自然的效果）
    const tweenY = scene.tweens.add({
      targets: obj,
      y: obj.y + shakeIntensity,
      duration: 50,
      yoyo: true,
      repeat: Math.floor(shakeDuration / 100) - 1,
      ease: 'Sine.easeInOut',
      delay: 25 // 与X轴错开，产生更复杂的抖动
    });
    
    tweens.push(tweenX, tweenY);
  });
  
  // 记录抖动持续时间
  window.__signals__.shakeDuration = shakeDuration;
  
  // 2秒后停止所有动画
  scene.time.delayedCall(shakeDuration, () => {
    tweens.forEach(tween => {
      if (tween.isPlaying()) {
        tween.stop();
      }
    });
    
    // 将物体恢复到初始位置
    objects.forEach((obj, index) => {
      obj.x = startX + index * spacing;
      obj.y = 300;
    });
    
    // 更新完成信号
    window.__signals__.animationCompleted = true;
    window.__signals__.completedAt = Date.now();
    
    console.log(JSON.stringify({
      event: 'animation_complete',
      duration: shakeDuration,
      objectsCount: objects.length,
      timestamp: Date.now()
    }));
    
    // 添加完成提示文本
    const text = scene.add.text(400, 500, 'Animation Completed!', {
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    });
    text.setOrigin(0.5);
  });
  
  // 添加标题文本
  const title = scene.add.text(400, 100, 'Synchronized Shake Animation', {
    fontSize: '28px',
    color: '#ffffff',
    align: 'center'
  });
  title.setOrigin(0.5);
  
  const subtitle = scene.add.text(400, 140, '3 objects shaking for 2 seconds', {
    fontSize: '18px',
    color: '#cccccc',
    align: 'center'
  });
  subtitle.setOrigin(0.5);
}

function update(time, delta) {
  // 每帧更新逻辑（本例中不需要）
}

// 创建游戏实例
new Phaser.Game(config);