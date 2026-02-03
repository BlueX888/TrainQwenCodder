const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let stars = [];
let starCount = 0;
const MAX_STARS = 3;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用Graphics创建橙色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制星形路径
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius + outerRadius,
      y: Math.sin(angle) * radius + outerRadius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('orangeStar', outerRadius * 2, outerRadius * 2);
  graphics.destroy();
  
  // 创建定时器事件，每0.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 500, // 0.5秒 = 500毫秒
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 生成星形的回调函数
  function spawnStar() {
    if (starCount >= MAX_STARS) {
      // 达到最大数量，停止定时器
      timerEvent.remove();
      return;
    }
    
    // 在随机位置生成星形
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    
    const star = this.add.image(x, y, 'orangeStar');
    star.setOrigin(0.5, 0.5);
    
    // 添加轻微的旋转动画效果
    this.tweens.add({
      targets: star,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
    
    stars.push(star);
    starCount++;
    
    console.log(`生成第 ${starCount} 个星形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);