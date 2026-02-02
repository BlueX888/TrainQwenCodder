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

let ellipse;
let rotationAngle = 0; // 当前旋转角度（度数）

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象并绘制椭圆
  ellipse = this.add.graphics();
  
  // 设置椭圆的填充颜色
  ellipse.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 150，高度 80）
  ellipse.fillEllipse(0, 0, 150, 80);
  
  // 将椭圆定位到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加一个小圆点标记椭圆的方向，方便观察旋转
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(75, 0, 8);
}

function update(time, delta) {
  // 每秒旋转 200 度
  const rotationSpeed = 200; // 度/秒
  
  // 根据 delta 时间计算本帧应该旋转的角度
  rotationAngle += rotationSpeed * (delta / 1000);
  
  // 将角度转换为弧度并应用到 Graphics 对象
  ellipse.rotation = Phaser.Math.DegToRad(rotationAngle);
}

new Phaser.Game(config);