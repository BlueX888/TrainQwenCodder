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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点（中心在 400, 300，半径 80）
  const centerX = 400;
  const centerY = 300;
  const radius = 80;
  const sides = 6;
  
  // 创建六边形路径
  const hexagonPath = new Phaser.Geom.Polygon();
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  hexagonPath.setTo(points);
  
  // 绘制六边形
  graphics.fillPoints(hexagonPath.points, true);
  
  // 设置六边形的原点为中心点
  graphics.x = centerX;
  graphics.y = centerY;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.32,  // 缩放到 32%
    scaleY: 0.32,
    duration: 3000, // 3 秒
    yoyo: true,     // 来回播放（缩小后恢复）
    loop: -1,       // 无限循环
    ease: 'Linear'  // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Hexagon scaling to 32% and back (3s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);