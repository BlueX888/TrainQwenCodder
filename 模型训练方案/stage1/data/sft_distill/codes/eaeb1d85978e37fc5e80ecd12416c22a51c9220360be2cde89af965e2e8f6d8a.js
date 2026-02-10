const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  bouncingObjects: 0,
  animationsActive: false,
  animationsStopped: false,
  elapsed: 0
};

let tweens = [];
let startTime = 0;
let animationDuration = 3000; // 3秒

function preload() {
  // 创建圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  const graphics2 = this.make.graphics({ x: 0, y: 0, add: false });
  graphics2.fillStyle(0x00ff00, 1);
  graphics2.fillCircle(25, 25, 25);
  graphics2.generateTexture('greenCircle', 50, 50);
  graphics2.destroy();

  const graphics3 = this.make.graphics({ x: 0, y: 0, add: false });
  graphics3.fillStyle(0x0000ff, 1);
  graphics3.fillCircle(25, 25, 25);
  graphics3.generateTexture('blueCircle', 50, 50);
  graphics3.destroy();
}

function create() {
  // 创建3个物体
  const object1 = this.add.image(200, 300, 'redCircle');
  const object2 = this.add.image(400, 300, 'greenCircle');
  const object3 = this.add.image(600, 300, 'blueCircle');

  const objects = [object1, object2, object3];

  // 更新信号
  window.__signals__.bouncingObjects = objects.length;
  window.__signals__.animationsActive = true;

  // 为每个物体创建弹跳动画
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      y: 150, // 向上弹跳到y=150
      duration: 500, // 每次弹跳持续500ms
      ease: 'Sine.easeInOut',
      yoyo: true, // 返回原位置
      repeat: -1, // 无限重复
      onStart: () => {
        console.log(JSON.stringify({
          event: 'bounce_start',
          object: index + 1,
          timestamp: Date.now()
        }));
      }
    });
    
    tweens.push(tween);
  });

  // 记录开始时间
  startTime = this.time.now;

  // 3秒后停止所有动画
  this.time.delayedCall(animationDuration, () => {
    tweens.forEach((tween, index) => {
      tween.stop();
      console.log(JSON.stringify({
        event: 'bounce_stop',
        object: index + 1,
        timestamp: Date.now()
      }));
    });

    window.__signals__.animationsActive = false;
    window.__signals__.animationsStopped = true;
    window.__signals__.elapsed = animationDuration;

    console.log(JSON.stringify({
      event: 'all_animations_stopped',
      duration: animationDuration,
      objects: window.__signals__.bouncingObjects,
      timestamp: Date.now()
    }));
  });

  console.log(JSON.stringify({
    event: 'scene_created',
    objects: objects.length,
    duration: animationDuration,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  // 更新已运行时间
  if (window.__signals__.animationsActive) {
    window.__signals__.elapsed = time - startTime;
  }
}

new Phaser.Game(config);