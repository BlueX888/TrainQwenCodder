const config = {
  type: Phaser.HEADLESS,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};

// 全局验证信号
window.__signals__ = {
  ballsCreated: false,
  animationStarted: false,
  animationStopped: false,
  ballPositions: [],
  timestamp: 0
};

let balls = [];
let tweens = [];
let startTime = 0;
let animationDuration = 3000; // 3秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 创建3个不同颜色的圆形纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const ballTextures = ['redBall', 'greenBall', 'blueBall'];
  
  colors.forEach((color, index) => {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture(ballTextures[index], 50, 50);
  });
  
  graphics.destroy();
  
  // 创建3个球体对象，水平排列
  const startX = 200;
  const spacing = 200;
  const startY = 300;
  
  for (let i = 0; i < 3; i++) {
    const ball = this.add.sprite(startX + i * spacing, startY, ballTextures[i]);
    balls.push(ball);
  }
  
  window.__signals__.ballsCreated = true;
  window.__signals__.ballPositions = balls.map(b => ({ x: b.x, y: b.y }));
  
  console.log(JSON.stringify({
    event: 'balls_created',
    count: balls.length,
    positions: window.__signals__.ballPositions,
    timestamp: Date.now()
  }));
  
  // 记录开始时间
  startTime = this.time.now;
  
  // 为每个球创建同步弹跳动画
  balls.forEach((ball, index) => {
    const tween = this.tweens.add({
      targets: ball,
      y: startY - 150, // 向上弹跳150像素
      duration: 500, // 单次弹跳持续0.5秒
      ease: 'Sine.easeInOut',
      yoyo: true, // 往复运动
      repeat: 2, // 重复2次（加上初始1次 = 3次完整弹跳 = 3秒）
      onStart: () => {
        if (index === 0) { // 只记录一次
          window.__signals__.animationStarted = true;
          window.__signals__.timestamp = Date.now();
          console.log(JSON.stringify({
            event: 'animation_started',
            duration: animationDuration,
            timestamp: window.__signals__.timestamp
          }));
        }
      },
      onComplete: () => {
        if (index === 0) { // 只记录一次
          window.__signals__.animationStopped = true;
          window.__signals__.ballPositions = balls.map(b => ({ x: b.x, y: b.y }));
          console.log(JSON.stringify({
            event: 'animation_completed',
            finalPositions: window.__signals__.ballPositions,
            elapsedTime: this.time.now - startTime,
            timestamp: Date.now()
          }));
        }
      }
    });
    
    tweens.push(tween);
  });
}

function update(time, delta) {
  // 实时更新球的位置信息
  if (balls.length > 0 && window.__signals__.animationStarted && !window.__signals__.animationStopped) {
    window.__signals__.ballPositions = balls.map(b => ({ 
      x: Math.round(b.x), 
      y: Math.round(b.y) 
    }));
  }
}

new Phaser.Game(config);