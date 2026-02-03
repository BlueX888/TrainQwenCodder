const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let rectangle;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  rectangle = this.add.graphics();
  
  // 设置填充颜色为蓝色
  rectangle.fillStyle(0x4a90e2, 1);
  
  // 绘制一个矩形（中心点在原点，便于旋转）
  // 矩形大小：宽 150，高 100
  rectangle.fillRect(-75, -50, 150, 100);
  
  // 设置矩形位置到画布中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 初始旋转角度为 0
  rectangle.rotation = 0;
}

function update(time, delta) {
  // 计算每帧旋转的角度
  // 240 度/秒 = 240 * (Math.PI / 180) 弧度/秒
  // delta 是以毫秒为单位，需要转换为秒：delta / 1000
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 当前帧旋转的弧度
  
  // 更新矩形的旋转角度
  rectangle.rotation += rotationDelta;
}

new Phaser.Game(config);