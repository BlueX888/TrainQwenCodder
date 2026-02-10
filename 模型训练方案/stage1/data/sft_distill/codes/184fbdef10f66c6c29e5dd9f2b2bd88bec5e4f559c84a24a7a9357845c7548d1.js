const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  objectCount: 0,
  rotationComplete: false,
  rotationDuration: 0,
  objects: [],
  startTime: 0,
  endTime: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  
  // 记录开始时间
  window.__signals__.startTime = Date.now();
  
  // 创建15个物体，排列成3行5列
  const rows = 3;
  const cols = 5;
  const spacingX = 150;
  const spacingY = 180;
  const startX = 100;
  const startY = 100;
  
  for (let i = 0; i < 15; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 创建容器用于旋转
    const container = scene.add.container(x, y);
    
    // 使用 Graphics 绘制一个带箭头的圆形，便于观察旋转
    const graphics = scene.add.graphics();
    
    // 绘制圆形主体
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 30);
    
    // 绘制箭头指示方向（用于观察旋转）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillTriangle(0, -30, -10, -15, 10, -15);
    
    // 添加文字标识
    const text = scene.add.text(0, 0, `${i + 1}`, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    });
    text.setOrigin(0.5);
    
    container.add([graphics, text]);
    
    objects.push({
      container: container,
      id: i + 1,
      initialRotation: 0,
      finalRotation: 0
    });
  }
  
  window.__signals__.objectCount = objects.length;
  
  // 创建同步旋转动画（旋转360度，持续0.5秒）
  const tweens = [];
  
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj.container,
      angle: 360, // 旋转360度
      duration: 500, // 持续0.5秒
      ease: 'Linear',
      onStart: () => {
        obj.initialRotation = obj.container.angle;
        console.log(`Object ${obj.id} started rotating`);
      },
      onUpdate: (tween, target) => {
        // 记录当前旋转角度
        obj.currentRotation = target.angle;
      },
      onComplete: () => {
        obj.finalRotation = obj.container.angle;
        console.log(`Object ${obj.id} completed rotation at angle: ${obj.finalRotation}`);
        
        // 检查所有动画是否完成
        const allComplete = objects.every(o => o.finalRotation !== 0);
        if (allComplete && !window.__signals__.rotationComplete) {
          window.__signals__.rotationComplete = true;
          window.__signals__.endTime = Date.now();
          window.__signals__.rotationDuration = window.__signals__.endTime - window.__signals__.startTime;
          
          // 记录所有物体的最终状态
          window.__signals__.objects = objects.map(o => ({
            id: o.id,
            initialRotation: o.initialRotation,
            finalRotation: o.finalRotation,
            x: o.container.x,
            y: o.container.y
          }));
          
          // 输出验证日志
          console.log(JSON.stringify({
            event: 'rotation_complete',
            objectCount: window.__signals__.objectCount,
            duration: window.__signals__.rotationDuration,
            expectedDuration: 500,
            allObjectsRotated: window.__signals__.objects.length === 15,
            timestamp: window.__signals__.endTime
          }));
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加调试信息显示
  const debugText = scene.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 更新调试信息
  scene.time.addEvent({
    delay: 100,
    callback: () => {
      const elapsed = Date.now() - window.__signals__.startTime;
      const status = window.__signals__.rotationComplete ? 'COMPLETE' : 'ROTATING';
      debugText.setText([
        `Status: ${status}`,
        `Objects: ${window.__signals__.objectCount}`,
        `Elapsed: ${elapsed}ms`,
        `Target: 500ms`
      ]);
    },
    loop: true
  });
}

function update(time, delta) {
  // 每帧更新逻辑（本例中主要依赖 tweens 系统）
}

new Phaser.Game(config);