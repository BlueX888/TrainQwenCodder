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

let diamond;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心在原点）
  diamond.beginPath();
  diamond.moveTo(0, -60);    // 上顶点
  diamond.lineTo(50, 0);     // 右顶点
  diamond.lineTo(0, 60);     // 下顶点
  diamond.lineTo(-50, 0);    // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 将菱形位置设置到屏幕中心
  diamond.x = 400;
  diamond.y = 300;
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是毫秒，转换为秒：delta / 1000
  // 旋转速度：2 * Math.PI 弧度/秒
  const rotationSpeed = 2 * Math.PI; // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  diamond.rotation += rotationDelta;
}

new Phaser.Game(config);