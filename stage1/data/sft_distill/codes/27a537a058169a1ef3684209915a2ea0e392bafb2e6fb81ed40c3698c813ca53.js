const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let starCount = 0;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: 32 + Math.cos(angle) * radius,
      y: 32 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  graphics.destroy();
  
  // 创建定时器事件，每2.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

function spawnStar() {
  // 检查是否已经生成了12个星形
  if (starCount >= 12) {
    if (timerEvent) {
      timerEvent.remove(); // 停止定时器
      console.log('已生成12个星形，停止生成');
    }
    return;
  }
  
  // 生成随机位置（确保星形完全在屏幕内）
  const margin = 32; // 星形半径
  const x = Phaser.Math.Between(margin, 800 - margin);
  const y = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  starCount++;
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);