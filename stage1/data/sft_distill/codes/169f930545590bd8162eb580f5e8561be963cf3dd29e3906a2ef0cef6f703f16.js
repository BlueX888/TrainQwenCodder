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

let rectangle;
let currentRotation = 0; // 当前旋转角度（度数）
const rotationSpeed = 200; // 每秒旋转 200 度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制矩形，以中心为原点
  // 矩形大小为 200x100，中心点在 (0, 0)
  graphics.fillRect(-100, -50, 200, 100);
  
  // 将 graphics 对象定位到屏幕中心
  graphics.setPosition(400, 300);
  
  // 保存引用以便在 update 中使用
  rectangle = graphics;
}

function update(time, delta) {
  // delta 是上一帧到当前帧的时间差（毫秒）
  // 将 delta 转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧应该旋转的角度（度数）
  const rotationThisFrame = rotationSpeed * deltaInSeconds;
  
  // 累加旋转角度
  currentRotation += rotationThisFrame;
  
  // 将角度转换为弧度并应用旋转
  // Phaser 使用弧度作为旋转单位
  const rotationInRadians = Phaser.Math.DegToRad(currentRotation);
  rectangle.setRotation(rotationInRadians);
}

new Phaser.Game(config);