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

let star;
let currentRotation = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制星形
  star = this.add.graphics();
  
  // 设置填充颜色为黄色
  star.fillStyle(0xffff00, 1);
  
  // 绘制五角星
  // fillStar(x, y, points, innerRadius, outerRadius, color)
  star.fillStar(0, 0, 5, 30, 60);
  
  // 将星形定位到屏幕中心
  star.x = 400;
  star.y = 300;
}

function update(time, delta) {
  // 计算旋转增量：120度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 120; // 度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000); // 度
  
  // 累加旋转角度
  currentRotation += rotationIncrement;
  
  // 转换为弧度并应用旋转
  star.setRotation(Phaser.Math.DegToRad(currentRotation));
}

new Phaser.Game(config);