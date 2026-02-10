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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  diamond = this.add.graphics();
  
  // 设置填充样式
  diamond.fillStyle(0x00ff00, 1);
  
  // 定义菱形的四个顶点（中心在原点）
  const size = 80;
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  diamond.fillPoints(polygon.points, true);
  
  // 将菱形移动到屏幕中心
  diamond.x = config.width / 2;
  diamond.y = config.height / 2;
  
  // 添加文字说明
  this.add.text(10, 10, '菱形旋转速度: 200度/秒', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 每秒旋转 200 度，转换为弧度
  const rotationSpeed = Phaser.Math.DegToRad(200);
  
  // 累加旋转角度
  diamond.rotation += rotationSpeed * deltaInSeconds;
}

// 启动游戏
new Phaser.Game(config);