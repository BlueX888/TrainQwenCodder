const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let rotationSpeed;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  star = this.add.graphics();
  
  // 设置填充颜色为黄色
  star.fillStyle(0xffff00, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius)
  star.fillStar(0, 0, 5, 30, 60);
  
  // 将星形定位到画布中心
  star.x = 400;
  star.y = 300;
  
  // 设置旋转速度：120度/秒 = 120 * (Math.PI / 180) 弧度/秒
  rotationSpeed = Phaser.Math.DegToRad(120);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差，需要转换为秒
  // 每帧增加旋转角度 = 旋转速度 * 时间增量（秒）
  star.rotation += rotationSpeed * (delta / 1000);
}

new Phaser.Game(config);