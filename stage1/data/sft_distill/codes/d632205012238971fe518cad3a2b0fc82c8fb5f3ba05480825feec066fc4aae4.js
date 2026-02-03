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
  // 创建 Graphics 对象绘制六边形
  hexagon = this.add.graphics();
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 六边形参数
  const radius = 100; // 半径
  const sides = 6;    // 边数
  
  // 开始绘制路径
  hexagon.beginPath();
  
  // 计算六边形的各个顶点并连接
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每60度一个顶点，从顶部开始
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      hexagon.moveTo(x, y);
    } else {
      hexagon.lineTo(x, y);
    }
  }
  
  // 闭合路径并填充
  hexagon.closePath();
  hexagon.fillPath();
  
  // 设置六边形位置到画布中心
  hexagon.x = config.width / 2;
  hexagon.y = config.height / 2;
}

function update(time, delta) {
  // 计算旋转增量：80度/秒 转换为弧度/毫秒
  // delta 是毫秒，80度/秒 = 80 * (Math.PI / 180) 弧度/秒 = 80 * (Math.PI / 180) / 1000 弧度/毫秒
  const rotationSpeed = 80 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 弧度/帧
  
  // 累加旋转角度
  hexagon.rotation += rotationDelta;
}

new Phaser.Game(config);