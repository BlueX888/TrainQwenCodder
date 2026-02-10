const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: 0,
  animationsStarted: 0,
  animationsStopped: 0,
  isAnimating: false,
  elapsedTime: 0,
  bounceCount: 0
};

let objects = [];
let tweens = [];
let startTime = 0;
let animationDuration = 3000; // 3秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  console.log(JSON.stringify({
    event: 'scene_created',
    timestamp: Date.now()
  }));

  // 创建3个不同颜色的圆形物体
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const positions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];

  for (let i = 0; i < 3; i++) {
    // 使用Graphics创建圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(0, 0, 30);
    graphics.generateTexture(`ball${i}`, 60, 60);
    graphics.destroy();

    // 创建精灵对象
    const ball = this.add.sprite(positions[i].x, positions[i].y, `ball${i}`);
    objects.push(ball);
    
    window.__signals__.objectsCreated++;
  }

  console.log(JSON.stringify({
    event: 'objects_created',
    count: window.__signals__.objectsCreated,
    timestamp: Date.now()
  }));

  // 记录开始时间
  startTime = this.time.now;

  // 为每个物体创建弹跳动画
  objects.forEach((ball, index) => {
    const tween = this.tweens.add({
      targets: ball,
      y: ball.y - 150, // 向上弹跳150像素
      duration: 500, // 单次弹跳持续500ms
      ease: 'Quad.easeInOut',
      yoyo: true, // 往复运动
      repeat: -1, // 无限重复
      onRepeat: () => {
        window.__signals__.bounceCount++;
      }
    });
    
    tweens.push(tween);
    window.__signals__.animationsStarted++;
  });

  window.__signals__.isAnimating = true;

  console.log(JSON.stringify({
    event: 'animations_started',
    count: window.__signals__.animationsStarted,
    timestamp: Date.now()
  }));

  // 设置3秒后停止动画的定时器
  this.time.delayedCall(animationDuration, () => {
    tweens.forEach(tween => {
      tween.stop();
      window.__signals__.animationsStopped++;
    });
    
    window.__signals__.isAnimating = false;

    console.log(JSON.stringify({
      event: 'animations_stopped',
      count: window.__signals__.animationsStopped,
      totalBounces: window.__signals__.bounceCount,
      duration: animationDuration,
      timestamp: Date.now()
    }));

    console.log(JSON.stringify({
      event: 'final_state',
      signals: window.__signals__,
      timestamp: Date.now()
    }));
  });
}

function update(time, delta) {
  // 更新已运行时间
  if (window.__signals__.isAnimating) {
    window.__signals__.elapsedTime = time - startTime;
  }
}

new Phaser.Game(config);