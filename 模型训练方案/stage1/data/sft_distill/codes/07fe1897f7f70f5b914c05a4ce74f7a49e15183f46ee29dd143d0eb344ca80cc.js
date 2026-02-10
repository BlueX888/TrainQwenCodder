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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形的参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100;  // 绘制中心点（相对于纹理）
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  graphics.lineStyle(4, 0xffffff, 1); // 白色边框
  
  // 计算六边形的六个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制多边形
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  graphics.strokePoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建六边形精灵并设置位置
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  hexagon.alpha = 0; // 设置初始透明度为 0
  
  // 创建 Tween 动画：从透明到不透明，4 秒循环
  this.tweens.add({
    targets: hexagon,
    alpha: 1,           // 目标透明度为 1（完全不透明）
    duration: 4000,     // 持续时间 4 秒
    ease: 'Linear',     // 线性缓动
    yoyo: false,        // 不反向播放
    repeat: -1,         // 无限循环
    repeatDelay: 0      // 重复延迟为 0
  });
  
  // 添加说明文字
  this.add.text(400, 50, 'Hexagon Fade In Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The hexagon fades from transparent to opaque in 4 seconds (looping)', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);