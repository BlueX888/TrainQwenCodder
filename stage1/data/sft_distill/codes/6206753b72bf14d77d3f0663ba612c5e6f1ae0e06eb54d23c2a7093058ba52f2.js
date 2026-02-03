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
const MAX_STARS = 12;
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用Graphics创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 20;
  const innerRadius = 10;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: Math.cos(angle) * radius + outerRadius,
      y: Math.sin(angle) * radius + outerRadius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建定时器，每2.5秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

function spawnStar() {
  if (starCount >= MAX_STARS) {
    // 达到最大数量，移除定时器
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'star');
  star.setOrigin(0.5, 0.5);
  
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