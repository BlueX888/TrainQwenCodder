const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制菱形
  diamond = this.add.graphics();
  
  // 设置菱形的中心位置
  diamond.x = 400;
  diamond.y = 300;
  
  // 设置填充颜色
  diamond.fillStyle(0xff6b6b, 1);
  
  // 绘制菱形（以原点为中心）
  // 菱形的四个顶点坐标
  const size = 80;
  diamond.beginPath();
  diamond.moveTo(0, -size);      // 上顶点
  diamond.lineTo(size, 0);       // 右顶点
  diamond.lineTo(0, size);       // 下顶点
  diamond.lineTo(-size, 0);      // 左顶点
  diamond.closePath();
  diamond.fillPath();
  
  // 添加描边使菱形更明显
  diamond.lineStyle(3, 0xffffff, 1);
  diamond.strokePath();
}

function update(time, delta) {
  // 每秒旋转 360 度 = 2π 弧度
  // delta 是以毫秒为单位的时间增量
  // 旋转速度：2π 弧度/秒 = 2π / 1000 弧度/毫秒
  const rotationSpeed = (Math.PI * 2) / 1000; // 弧度/毫秒
  
  // 更新旋转角度
  diamond.rotation += rotationSpeed * delta;
}

new Phaser.Game(config);