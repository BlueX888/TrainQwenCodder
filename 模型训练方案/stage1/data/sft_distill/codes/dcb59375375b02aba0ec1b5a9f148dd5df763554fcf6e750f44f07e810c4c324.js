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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  rectangle = this.add.graphics();
  
  // 设置填充颜色为蓝色
  rectangle.fillStyle(0x4a90e2, 1);
  
  // 绘制矩形，以中心点为原点（-100, -50 到 100, 50）
  rectangle.fillRect(-100, -50, 200, 100);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 初始旋转角度为 0
  rectangle.rotation = 0;
}

function update(time, delta) {
  // 将每秒 300 度转换为弧度/毫秒
  // 300 度 = 300 * (Math.PI / 180) 弧度
  // delta 是毫秒，所以需要除以 1000
  const rotationSpeed = (300 * Math.PI / 180) * (delta / 1000);
  
  // 累加旋转角度
  rectangle.rotation += rotationSpeed;
}

new Phaser.Game(config);