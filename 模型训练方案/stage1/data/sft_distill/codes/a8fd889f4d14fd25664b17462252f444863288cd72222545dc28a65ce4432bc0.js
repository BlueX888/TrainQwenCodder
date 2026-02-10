const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 初始化信号对象
window.__signals__ = {
  animationState: 'idle',
  objectsCount: 0,
  elapsedTime: 0,
  objectsData: [],
  animationStopped: false
};

let objects = [];
let tweens = [];
let startTime = 0;
let animationDuration = 3000; // 3秒

function preload() {
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('ball', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建10个物体
  const spacing = 70;
  const startX = 100;
  const baseY = 300;

  for (let i = 0; i < 10; i++) {
    const ball = this.add.sprite(startX + i * spacing, baseY, 'ball');
    ball.setTint(Phaser.Display.Color.HSVToRGB(i / 10, 1, 1).color);
    objects.push(ball);
  }

  // 更新信号
  window.__signals__.objectsCount = objects.length;
  window.__signals__.animationState = 'running';

  // 为每个物体创建弹跳动画
  objects.forEach((ball, index) => {
    const tween = this.tweens.add({
      targets: ball,
      y: baseY - 150, // 向上弹跳150像素
      duration: 500, // 单次弹跳持续500ms
      ease: 'Quad.easeInOut',
      yoyo: true, // 往返运动
      repeat: -1, // 无限循环
      delay: 0 // 同步开始，无延迟
    });
    
    tweens.push(tween);
  });

  // 记录开始时间
  startTime = this.time.now;

  // 设置3秒后停止动画的定时器
  this.time.delayedCall(animationDuration, () => {
    // 停止所有 Tween
    tweens.forEach(tween => {
      tween.stop();
    });

    // 更新信号状态
    window.__signals__.animationState = 'stopped';
    window.__signals__.animationStopped = true;
    
    // 记录最终位置
    window.__signals__.objectsData = objects.map((ball, index) => ({
      id: index,
      x: ball.x,
      y: ball.y,
      color: ball.tintTopLeft
    }));

    console.log('Animation stopped after 3 seconds');
    console.log(JSON.stringify(window.__signals__, null, 2));
  });

  // 添加文本提示
  this.add.text(10, 10, '10 objects bouncing synchronously', {
    fontSize: '20px',
    color: '#ffffff'
  });

  this.add.text(10, 40, 'Animation will stop after 3 seconds', {
    fontSize: '16px',
    color: '#ffff00'
  });
}

function update(time, delta) {
  // 更新经过的时间
  if (window.__signals__.animationState === 'running') {
    window.__signals__.elapsedTime = time - startTime;
    
    // 实时更新物体位置数据
    window.__signals__.objectsData = objects.map((ball, index) => ({
      id: index,
      x: Math.round(ball.x),
      y: Math.round(ball.y)
    }));
  }
}

new Phaser.Game(config);