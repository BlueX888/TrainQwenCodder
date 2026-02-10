const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  animationStarted: false,
  animationCompleted: false,
  objectCount: 0,
  duration: 0,
  logs: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const objects = [];
  const objectCount = 8;
  const startTime = Date.now();
  
  // 创建8个图形对象，排列成两行
  for (let i = 0; i < objectCount; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    
    // 绘制圆形
    const radius = 30;
    graphics.fillCircle(radius, radius, radius);
    
    // 计算位置（2行4列布局）
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 150 + col * 150;
    const y = 200 + row * 150;
    
    graphics.setPosition(x, y);
    objects.push(graphics);
  }
  
  // 记录初始状态
  window.__signals__.objectCount = objectCount;
  window.__signals__.animationStarted = true;
  window.__signals__.logs.push({
    timestamp: Date.now(),
    event: 'animation_started',
    objectCount: objectCount
  });
  
  // 创建同步闪烁动画
  const duration = 1500; // 1.5秒
  window.__signals__.duration = duration;
  
  // 为所有对象创建同步的闪烁Tween
  objects.forEach((obj, index) => {
    this.tweens.add({
      targets: obj,
      alpha: 0, // 从1淡出到0
      duration: 250, // 单次闪烁时间
      yoyo: true, // 往返效果（淡出再淡入）
      repeat: 2, // 重复2次，加上初始1次共3次闪烁（约1.5秒）
      ease: 'Sine.easeInOut',
      onStart: () => {
        if (index === 0) {
          window.__signals__.logs.push({
            timestamp: Date.now(),
            event: 'tween_started',
            elapsedFromStart: Date.now() - startTime
          });
        }
      },
      onComplete: () => {
        // 确保最终alpha为1（完全可见）
        obj.setAlpha(1);
        
        if (index === 0) {
          // 只在第一个对象完成时记录
          window.__signals__.animationCompleted = true;
          window.__signals__.logs.push({
            timestamp: Date.now(),
            event: 'animation_completed',
            totalDuration: Date.now() - startTime,
            expectedDuration: duration
          });
          
          console.log('Animation completed:', JSON.stringify(window.__signals__, null, 2));
        }
      }
    });
  });
  
  // 额外的定时器验证（1.5秒后检查状态）
  this.time.delayedCall(duration + 100, () => {
    window.__signals__.logs.push({
      timestamp: Date.now(),
      event: 'verification_check',
      allObjectsVisible: objects.every(obj => obj.alpha === 1),
      actualDuration: Date.now() - startTime
    });
    
    console.log('Final verification:', JSON.stringify(window.__signals__, null, 2));
  });
}

function update(time, delta) {
  // 无需每帧更新逻辑
}

new Phaser.Game(config);