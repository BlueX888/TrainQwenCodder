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
const rotationSpeed = Phaser.Math.DegToRad(80); // 每秒 80 度，转换为弧度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  ellipse = this.add.graphics();
  
  // 设置椭圆的填充颜色
  ellipse.fillStyle(0x00ff00, 1);
  
  // 绘制椭圆（中心点在原点，方便旋转）
  // fillEllipse(x, y, width, height)
  ellipse.fillEllipse(0, 0, 200, 100);
  
  // 将椭圆移动到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加一个小点标记椭圆的"顶部"，便于观察旋转
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(0, -50, 8);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间差
  // 将 delta 转换为秒，然后乘以旋转速度
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 更新椭圆的旋转角度
  ellipse.rotation += rotationIncrement;
}

new Phaser.Game(config);