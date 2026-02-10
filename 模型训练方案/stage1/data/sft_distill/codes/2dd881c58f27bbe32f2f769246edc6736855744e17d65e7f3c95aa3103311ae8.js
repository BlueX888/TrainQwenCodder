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

let triangle;
const rotationSpeed = Phaser.Math.DegToRad(120); // 每秒 120 度转换为弧度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  triangle = this.add.graphics();
  
  // 设置填充颜色
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（以原点为中心）
  // 三角形顶点坐标（相对于中心点）
  const size = 80;
  triangle.fillTriangle(
    0, -size,           // 顶点
    -size, size,        // 左下角
    size, size          // 右下角
  );
  
  // 设置三角形位置到画布中心
  triangle.x = 400;
  triangle.y = 300;
  
  // 添加提示文本
  const text = this.add.text(10, 10, '三角形以每秒 120° 旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 根据时间增量计算旋转角度
  // delta 是毫秒，需要转换为秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  triangle.rotation += rotationDelta;
}

new Phaser.Game(config);