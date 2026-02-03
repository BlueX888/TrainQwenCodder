const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let diamond;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 定义菱形的四个顶点（以原点为中心）
  const size = 100;
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];
  
  // 绘制填充的多边形
  diamond.fillPoints(points, true);
  
  // 将菱形移动到画布中心
  diamond.x = 400;
  diamond.y = 300;
}

function update(time, delta) {
  // 每秒旋转 200 度
  // delta 单位是毫秒，需要转换为秒
  // 角度转弧度：degrees * (Math.PI / 180)
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  
  // 累加旋转角度
  diamond.rotation += rotationSpeed * deltaSeconds;
}

new Phaser.Game(config);