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

let stars = [];
let timerEvent = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建星形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形（5个尖角）
  const points = [];
  const outerRadius = 25;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * radius + 30,
      y: Math.sin(angle) * radius + 30
    });
  }
  
  graphics.fillPoints(points, true);
  graphics.generateTexture('star', 60, 60);
  graphics.destroy();
  
  // 创建定时器事件，每1.5秒执行一次
  timerEvent = this.time.addEvent({
    delay: 1500,
    callback: spawnStar,
    callbackScope: this,
    loop: true
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个星形，最多5个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function spawnStar() {
  // 检查是否已达到最大数量
  if (stars.length >= 5) {
    if (timerEvent) {
      timerEvent.remove();
      timerEvent = null;
    }
    return;
  }
  
  // 生成随机位置（避免贴边）
  const x = Phaser.Math.Between(50, 750);
  const y = Phaser.Math.Between(50, 550);
  
  // 创建星形精灵
  const star = this.add.image(x, y, 'star');
  star.setScale(0.8);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: star,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 保存到数组
  stars.push(star);
  
  console.log(`生成第 ${stars.length} 个星形，位置: (${x}, ${y})`);
}

new Phaser.Game(config);