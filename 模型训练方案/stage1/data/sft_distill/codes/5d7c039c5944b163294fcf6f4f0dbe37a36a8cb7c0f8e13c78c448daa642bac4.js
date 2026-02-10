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
let currentRotation = 0; // 当前旋转角度（度）
const ROTATION_SPEED = 200; // 每秒旋转 200 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipse = this.add.graphics();
  
  // 设置椭圆位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 绘制椭圆（中心点在 0,0，因为已经通过 x/y 设置了位置）
  ellipse.fillStyle(0x00ff00, 1);
  ellipse.fillEllipse(0, 0, 150, 80); // 宽度 150，高度 80
  
  // 绘制一个小圆点标记椭圆方向，便于观察旋转
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(75, 0, 10);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaSeconds = delta / 1000;
  
  // 累加旋转角度
  currentRotation += ROTATION_SPEED * deltaSeconds;
  
  // 保持角度在 0-360 范围内（可选，防止数值过大）
  if (currentRotation >= 360) {
    currentRotation -= 360;
  }
  
  // 将角度转换为弧度并应用到椭圆
  ellipse.rotation = Phaser.Math.DegToRad(currentRotation);
}

new Phaser.Game(config);