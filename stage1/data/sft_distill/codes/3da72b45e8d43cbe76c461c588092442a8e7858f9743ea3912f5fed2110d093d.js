const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let stars = [];
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  
  // 绘制星形路径
  const starPoints = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    starPoints.push({
      x: 32 + Math.cos(angle) * radius,
      y: 32 + Math.sin(angle) * radius
    });
  }
  
  graphics.fillPoints(starPoints, true);
  graphics.generateTexture('blueStar', 64, 64);
  graphics.destroy();
  
  // 创建定时器，每1.5秒触发一次
  timerEvent = this.time.addEvent({
    delay: 1500,
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个星形
  spawnStar.call(this);
}

function spawnStar() {
  // 检查星形数量是否已达到3个
  if (stars.length >= 3) {
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 在随机位置生成星形
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  const star = this.add.image(x, y, 'blueStar');
  stars.push(star);
  
  // 添加缩放动画效果
  star.setScale(0);
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

new Phaser.Game(config);