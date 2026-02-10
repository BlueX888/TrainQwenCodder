const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let diamond;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制菱形
  diamond = this.add.graphics();
  
  // 设置菱形的位置在画布中心
  diamond.x = 400;
  diamond.y = 300;
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 定义菱形的四个顶点（相对于中心点）
  const points = [
    0, -80,    // 上顶点
    60, 0,     // 右顶点
    0, 80,     // 下顶点
    -60, 0     // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  diamond.fillPoints(polygon.points, true);
}

function update(time, delta) {
  // 每秒旋转 80 度
  // delta 是毫秒，转换为秒：delta / 1000
  // 角度转弧度：Phaser.Math.DegToRad(80)
  const rotationSpeed = Phaser.Math.DegToRad(80); // 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 更新菱形的旋转角度
  diamond.rotation += rotationIncrement;
}

new Phaser.Game(config);