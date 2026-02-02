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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建青色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制五角星路径
  const starPoints = [];
  const outerRadius = 20;
  const innerRadius = 8;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    starPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
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
  graphics.generateTexture('star', 40, 40);
  graphics.destroy();
  
  // 创建定时器事件，每2.5秒生成一个星形
  this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

function spawnStar() {
  if (starCount >= MAX_STARS) {
    // 达到最大数量，停止生成
    return;
  }
  
  // 生成随机位置（考虑星形大小，避免超出边界）
  const x = Phaser.Math.Between(30, 770);
  const y = Phaser.Math.Between(30, 570);
  
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
  
  // 如果达到最大数量，可以在控制台输出提示
  if (starCount >= MAX_STARS) {
    console.log('已生成12个星形，停止生成');
  }
}

new Phaser.Game(config);