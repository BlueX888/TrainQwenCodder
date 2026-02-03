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
const rotationSpeed = Phaser.Math.DegToRad(240); // 每秒 240 度转换为弧度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  
  // 设置矩形样式和位置
  rectangle.fillStyle(0x00ff00, 1);
  rectangle.fillRect(-50, -30, 100, 60); // 以中心点为原点绘制
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 添加参考点（可选，用于观察旋转）
  const centerDot = this.add.graphics();
  centerDot.fillStyle(0xff0000, 1);
  centerDot.fillCircle(400, 300, 5);
  
  // 添加文字说明
  this.add.text(10, 10, '矩形旋转速度: 240度/秒', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 根据 delta 时间增量更新旋转角度
  // delta 单位是毫秒，需要转换为秒
  currentRotation += rotationSpeed * (delta / 1000);
  
  // 应用旋转
  rectangle.setRotation(currentRotation);
  
  // 可选：防止角度值无限增长，每 2π 重置一次
  if (currentRotation >= Math.PI * 2) {
    currentRotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);