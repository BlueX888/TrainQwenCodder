const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局验证信号
window.__signals__ = {
  objectsCreated: 0,
  animationsStarted: 0,
  animationsCompleted: 0,
  shakeDuration: 1000,
  isShaking: false,
  timestamp: Date.now()
};

let objects = [];
let tweens = [];
let startTime = 0;

function preload() {
  // 程序化生成8种不同颜色的纹理
  const colors = [
    0xff0000, // 红色
    0x00ff00, // 绿色
    0x0000ff, // 蓝色
    0xffff00, // 黄色
    0xff00ff, // 紫色
    0x00ffff, // 青色
    0xff8800, // 橙色
    0x8800ff  // 紫罗兰
  ];

  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture(`box${index}`, 60, 60);
    graphics.destroy();
  });

  console.log('[Preload] Generated 8 colored textures');
}

function create() {
  const startX = 150;
  const startY = 200;
  const spacingX = 120;
  const spacingY = 150;

  // 创建8个物体（2行4列布局）
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 4 + col;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      const obj = this.add.sprite(x, y, `box${index}`);
      obj.setOrigin(0.5);
      obj.initialX = x;
      obj.initialY = y;
      objects.push(obj);
      
      window.__signals__.objectsCreated++;
    }
  }

  console.log(`[Create] Created ${objects.length} objects`);

  // 记录开始时间
  startTime = this.time.now;
  window.__signals__.isShaking = true;

  // 为每个物体创建同步抖动动画
  objects.forEach((obj, index) => {
    // X轴抖动
    const tweenX = this.tweens.add({
      targets: obj,
      x: obj.initialX + Phaser.Math.Between(-10, 10),
      duration: 50,
      yoyo: true,
      repeat: 9, // 50ms * 2 * 10 = 1000ms
      ease: 'Sine.easeInOut',
      onStart: () => {
        if (index === 0) {
          window.__signals__.animationsStarted++;
          console.log('[Animation] Shake started');
        }
      }
    });

    // Y轴抖动
    const tweenY = this.tweens.add({
      targets: obj,
      y: obj.initialY + Phaser.Math.Between(-10, 10),
      duration: 50,
      yoyo: true,
      repeat: 9,
      ease: 'Sine.easeInOut'
    });

    tweens.push(tweenX, tweenY);
  });

  // 1秒后停止所有动画
  this.time.delapsedCall(1000, () => {
    tweens.forEach(tween => {
      tween.stop();
    });

    // 恢复所有物体到初始位置
    objects.forEach(obj => {
      obj.x = obj.initialX;
      obj.y = obj.initialY;
    });

    window.__signals__.isShaking = false;
    window.__signals__.animationsCompleted = objects.length;
    
    console.log('[Animation] Shake completed after 1 second');
    console.log('[Signals]', JSON.stringify(window.__signals__, null, 2));
  });
}

function update(time, delta) {
  // 实时更新抖动状态
  if (window.__signals__.isShaking && startTime > 0) {
    const elapsed = time - startTime;
    if (elapsed >= 1000 && window.__signals__.isShaking) {
      window.__signals__.isShaking = false;
    }
  }
}

new Phaser.Game(config);