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
  // 创建 Graphics 对象用于绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标
  const centerX = 400;
  const centerY = 300;
  const radius = 80;
  const sides = 6;
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 创建多边形并填充
  const hexagon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(hexagon.points, true);
  
  // 创建缩放动画
  // yoyo: true 表示动画会自动反向播放（缩小后放大）
  // loop: -1 表示无限循环
  // duration: 2000 表示单程2秒，往返共4秒
  this.tweens.add({
    targets: graphics,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 2000,        // 单程时长2秒
    yoyo: true,            // 启用往返模式
    loop: -1,              // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, '六边形缩放动画 (100% ↔ 32%)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '4秒循环：2秒缩小到32% + 2秒恢复到100%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);