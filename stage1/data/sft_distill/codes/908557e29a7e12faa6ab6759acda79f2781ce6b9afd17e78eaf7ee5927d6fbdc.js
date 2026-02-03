const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制六边形
  hexagon = this.add.graphics();
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  const radius = 80; // 六边形半径
  const sides = 6;
  
  hexagon.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // 从顶部开始
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      hexagon.moveTo(x, y);
    } else {
      hexagon.lineTo(x, y);
    }
  }
  
  hexagon.closePath();
  hexagon.fillPath();
  
  // 设置六边形位置到屏幕中心
  hexagon.x = config.width / 2;
  hexagon.y = config.height / 2;
  
  // 初始化旋转角度
  hexagon.rotation = 0;
}

function update(time, delta) {
  // 每秒旋转 300 度
  // 将角度转换为弧度：300度 = 300 * (Math.PI / 180) 弧度
  const rotationSpeed = 300 * (Math.PI / 180); // 弧度/秒
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  hexagon.rotation += rotationSpeed * (delta / 1000);
  
  // 可选：防止角度无限增长，保持在 0-2π 范围内
  if (hexagon.rotation > Math.PI * 2) {
    hexagon.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);