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
let rotationSpeed = 80; // 每秒旋转 80 度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象并绘制椭圆
  ellipse = this.add.graphics();
  
  // 设置椭圆位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 设置填充样式并绘制椭圆
  ellipse.fillStyle(0x00ff00, 1);
  // 椭圆中心在 (0, 0)，长轴 120，短轴 60
  ellipse.fillEllipse(0, 0, 120, 60);
  
  // 添加一个标记点，便于观察旋转效果
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(60, 0, 8);
}

function update(time, delta) {
  // delta 是以毫秒为单位的时间增量
  // 计算本帧应该旋转的角度（度）
  const rotationDegrees = rotationSpeed * (delta / 1000);
  
  // 将角度转换为弧度并累加到当前旋转值
  ellipse.rotation += Phaser.Math.DegToRad(rotationDegrees);
}

new Phaser.Game(config);