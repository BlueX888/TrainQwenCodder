const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 创建星形几何体（中心点，5个尖角，内半径30，外半径60）
  const star = new Phaser.Geom.Star(400, 300, 5, 30, 60);
  
  // 填充星形路径
  graphics.fillPath();
  graphics.fillPoints(star.points, true);
  
  // 将 graphics 存储到 scene 数据中以便在 update 中访问
  this.star = graphics;
  
  // 设置旋转中心点为星形中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 重新绘制星形，使其相对于自身中心点
  graphics.clear();
  graphics.fillStyle(0xffff00, 1);
  const centerStar = new Phaser.Geom.Star(0, 0, 5, 30, 60);
  graphics.fillPoints(centerStar.points, true);
}

function update(time, delta) {
  // 每秒旋转300度 = 每毫秒旋转300/1000度
  // delta 是毫秒数，需要转换为弧度
  // 300度/秒 = 300 * (Math.PI / 180) 弧度/秒
  const rotationSpeed = 300 * (Math.PI / 180); // 弧度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  
  // 更新旋转角度
  this.star.rotation += rotationSpeed * deltaSeconds;
}

new Phaser.Game(config);