const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 初始化全局信号对象
window.__signals__ = {
  animationStarted: false,
  animationCompleted: false,
  objectCount: 0,
  rotationAngle: 0,
  elapsedTime: 0
};

let objects = [];
let startTime = 0;
let animationDuration = 500; // 0.5秒 = 500毫秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建15个物体
  const objectCount = 15;
  const radius = 200; // 圆形排列的半径
  const centerX = 400;
  const centerY = 300;
  
  for (let i = 0; i < objectCount; i++) {
    // 计算物体在圆形上的位置
    const angle = (i / objectCount) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 创建容器用于旋转
    const container = scene.add.container(x, y);
    
    // 使用Graphics绘制一个带箭头的圆形，方便观察旋转
    const graphics = scene.add.graphics();
    
    // 绘制圆形主体
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    
    // 绘制箭头指示旋转方向
    graphics.fillStyle(0xff0000, 1);
    graphics.fillTriangle(
      0, -20,    // 顶点
      -8, -5,    // 左下
      8, -5      // 右下
    );
    
    container.add(graphics);
    objects.push(container);
  }
  
  // 更新信号
  window.__signals__.objectCount = objectCount;
  window.__signals__.animationStarted = true;
  
  // 记录开始时间
  startTime = scene.time.now;
  
  // 为所有物体添加同步旋转动画
  objects.forEach((obj, index) => {
    scene.tweens.add({
      targets: obj,
      angle: 360, // 旋转360度
      duration: animationDuration, // 持续0.5秒
      ease: 'Linear',
      onComplete: () => {
        // 只在最后一个物体完成时设置完成标志
        if (index === objects.length - 1) {
          window.__signals__.animationCompleted = true;
          console.log(JSON.stringify({
            event: 'animationCompleted',
            objectCount: objectCount,
            duration: animationDuration,
            finalAngle: 360
          }));
        }
      }
    });
  });
  
  // 添加文字提示
  const text = scene.add.text(400, 50, '15个物体同步旋转动画\n持续0.5秒', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 添加状态文字
  const statusText = scene.add.text(400, 550, '', {
    fontSize: '18px',
    color: '#ffff00',
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 存储文字对象供update使用
  scene.statusText = statusText;
  
  console.log(JSON.stringify({
    event: 'animationStarted',
    objectCount: objectCount,
    duration: animationDuration
  }));
}

function update(time, delta) {
  // 更新经过的时间
  if (startTime > 0 && !window.__signals__.animationCompleted) {
    window.__signals__.elapsedTime = time - startTime;
    
    // 更新第一个物体的旋转角度作为参考
    if (objects.length > 0) {
      window.__signals__.rotationAngle = objects[0].angle;
    }
    
    // 更新状态文字
    if (this.statusText) {
      const elapsed = Math.min(window.__signals__.elapsedTime, animationDuration);
      const progress = (elapsed / animationDuration * 100).toFixed(1);
      this.statusText.setText(
        `进度: ${progress}% | 角度: ${window.__signals__.rotationAngle.toFixed(1)}°`
      );
    }
  } else if (window.__signals__.animationCompleted && this.statusText) {
    this.statusText.setText('动画已完成！');
  }
}

// 创建游戏实例
new Phaser.Game(config);