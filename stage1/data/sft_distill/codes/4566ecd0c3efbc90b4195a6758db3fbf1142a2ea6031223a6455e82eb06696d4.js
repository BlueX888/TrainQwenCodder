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
let currentRotation = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  
  // 设置矩形位置为画布中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 绘制一个蓝色矩形（中心对齐）
  rectangle.fillStyle(0x3498db, 1);
  rectangle.fillRect(-100, -50, 200, 100);
  
  // 添加提示文字
  this.add.text(10, 10, '矩形以每秒 240 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算旋转增量
  // 240 度/秒 = 240 * (Math.PI / 180) 弧度/秒 = 4.189 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 应用旋转
  rectangle.rotation = currentRotation;
}

new Phaser.Game(config);