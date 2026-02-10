const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: false,
  animationStarted: false,
  animationCompleted: false,
  objectCount: 0,
  animationDuration: 0,
  finalAlphaValues: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x8800ff];
  
  // 创建8个不同颜色的矩形物体
  for (let i = 0; i < 8; i++) {
    const graphics = scene.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(0, 0, 80, 80);
    
    // 生成纹理
    graphics.generateTexture(`object${i}`, 80, 80);
    graphics.destroy();
    
    // 创建精灵
    const sprite = scene.add.sprite(
      100 + (i % 4) * 150,
      150 + Math.floor(i / 4) * 200,
      `object${i}`
    );
    
    // 初始设置为完全透明
    sprite.setAlpha(0);
    objects.push(sprite);
  }
  
  window.__signals__.objectsCreated = true;
  window.__signals__.objectCount = objects.length;
  
  console.log(JSON.stringify({
    event: 'objects_created',
    count: objects.length,
    timestamp: Date.now()
  }));
  
  // 创建同步的淡入淡出动画
  const tweens = objects.map(obj => {
    return {
      targets: obj,
      alpha: 1,
      duration: 250, // 0.25秒淡入
      yoyo: true,    // 自动淡出
      ease: 'Linear'
    };
  });
  
  // 使用 addMultiple 同步启动所有动画
  const tweenGroup = scene.tweens.addMultiple(tweens);
  
  window.__signals__.animationStarted = true;
  window.__signals__.animationDuration = 500; // 总时长0.5秒
  
  console.log(JSON.stringify({
    event: 'animation_started',
    objectCount: objects.length,
    duration: 500,
    timestamp: Date.now()
  }));
  
  // 监听第一个动画完成（所有动画同步，只需监听一个）
  scene.tweens.getTweensOf(objects[0])[0].on('complete', () => {
    window.__signals__.animationCompleted = true;
    
    // 记录所有物体的最终 alpha 值
    window.__signals__.finalAlphaValues = objects.map(obj => obj.alpha);
    
    console.log(JSON.stringify({
      event: 'animation_completed',
      finalAlphaValues: window.__signals__.finalAlphaValues,
      allObjectsTransparent: window.__signals__.finalAlphaValues.every(a => a === 0),
      timestamp: Date.now()
    }));
  });
  
  // 可选：在0.5秒后验证动画已停止
  scene.time.delayedCall(600, () => {
    const allStopped = objects.every(obj => {
      const tweensOfObj = scene.tweens.getTweensOf(obj);
      return tweensOfObj.length === 0 || tweensOfObj.every(t => !t.isPlaying());
    });
    
    console.log(JSON.stringify({
      event: 'verification',
      allAnimationsStopped: allStopped,
      timestamp: Date.now()
    }));
  });
}

function update(time, delta) {
  // 无需每帧更新逻辑
}

new Phaser.Game(config);