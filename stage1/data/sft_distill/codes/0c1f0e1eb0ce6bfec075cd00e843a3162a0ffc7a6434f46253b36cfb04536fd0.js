const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
const rotationSpeed = Phaser.Math.DegToRad(120); // 每秒 120 度转换为弧度

function preload() {
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象
  star = this.add.graphics();
  
  // 设置填充样式
  star.fillStyle(0xffff00, 1);
  
  // 创建星形几何对象（中心点在屏幕中央）
  const starShape = new Phaser.Geom.Star(400, 300, 5, 40, 80);
  
  // 填充星形路径
  star.fillPath();
  star.fillPoints(starShape.points, true);
  
  // 设置旋转中心点（默认是左上角，需要设置为星形中心）
  star.x = 0;
  star.y = 0;
}

function update(time, delta) {
  // 根据时间增量更新旋转角度
  // delta 是毫秒，需要转换为秒
  const deltaInSeconds = delta / 1000;
  star.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);