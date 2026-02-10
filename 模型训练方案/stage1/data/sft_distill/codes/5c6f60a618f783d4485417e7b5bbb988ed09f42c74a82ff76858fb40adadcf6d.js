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
  // 无需预加载外部资源
}

function create() {
  // 重置星形计数器
  starCount = 0;
  
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制五角星
  const starRadius = 30;
  const starPoints = [];
  
  // 计算五角星的 10 个顶点（5 个外顶点 + 5 个内顶点交替）
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
    const radius = i % 2 === 0 ? starRadius : starRadius * 0.4;
    starPoints.push({
      x: Math.cos(angle) * radius + starRadius,
      y: Math.sin(angle) * radius + starRadius
    });
  }
  
  // 绘制星形路径
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.beginPath();
  graphics.moveTo(starPoints[0].x, starPoints[0].y);
  
  for (let i = 1; i < starPoints.length; i++) {
    graphics.lineTo(starPoints[i].x, starPoints[i].y);
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', starRadius * 2, starRadius * 2);
  graphics.destroy();
  
  // 创建定时器事件，每 0.5 秒生成一个星形
  timerEvent = this.time.addEvent({
    delay: 500, // 0.5 秒 = 500 毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
}

function spawnStar() {
  // 检查是否已经生成了 3 个星形
  if (starCount >= 3) {
    // 停止定时器
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
  
  // 添加一个简单的缩放动画效果
  star.setScale(0);
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  // 增加星形计数
  starCount++;
  
  console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);