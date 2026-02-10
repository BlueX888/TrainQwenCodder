const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  animationStarted: false,
  animationStopped: false,
  blinkCount: 0,
  objectsCount: 8,
  duration: 1.5,
  timestamp: Date.now()
};

let objects = [];
let tweens = [];
let animationActive = false;

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建8个物体，排列成2行4列
  const startX = 150;
  const startY = 200;
  const spacingX = 150;
  const spacingY = 200;
  
  for (let i = 0; i < 8; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    const obj = this.add.image(x, y, 'circle');
    obj.setScale(1.5);
    objects.push(obj);
  }
  
  // 开始同步闪烁动画
  startBlinkAnimation.call(this);
  
  // 1.5秒后停止动画
  this.time.delayedCall(1500, () => {
    stopBlinkAnimation.call(this);
  });
  
  // 添加文本提示
  this.add.text(400, 50, 'Synchronized Blinking Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Animation will stop after 1.5 seconds', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);
}

function startBlinkAnimation() {
  animationActive = true;
  window.__signals__.animationStarted = true;
  window.__signals__.startTime = Date.now();
  
  // 为每个物体创建闪烁动画
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      alpha: 0.2,
      duration: 250,
      yoyo: true,
      repeat: -1, // 无限重复
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        // 只在第一个物体上计数，避免重复计数
        if (index === 0) {
          window.__signals__.blinkCount++;
        }
      }
    });
    
    tweens.push(tween);
  });
  
  console.log(JSON.stringify({
    event: 'animation_started',
    objectsCount: objects.length,
    timestamp: Date.now()
  }));
}

function stopBlinkAnimation() {
  if (!animationActive) return;
  
  animationActive = false;
  window.__signals__.animationStopped = true;
  window.__signals__.endTime = Date.now();
  window.__signals__.actualDuration = window.__signals__.endTime - window.__signals__.startTime;
  
  // 停止所有tween动画
  tweens.forEach(tween => {
    tween.stop();
  });
  
  // 重置所有物体的alpha为1
  objects.forEach(obj => {
    obj.setAlpha(1);
  });
  
  console.log(JSON.stringify({
    event: 'animation_stopped',
    blinkCount: window.__signals__.blinkCount,
    duration: window.__signals__.actualDuration,
    timestamp: Date.now()
  }));
  
  // 显示完成提示
  this.add.text(400, 100, 'Animation Stopped!', {
    fontSize: '28px',
    color: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加实时状态更新
  if (animationActive) {
    const elapsed = Date.now() - window.__signals__.startTime;
    window.__signals__.elapsedTime = elapsed;
  }
}

new Phaser.Game(config);