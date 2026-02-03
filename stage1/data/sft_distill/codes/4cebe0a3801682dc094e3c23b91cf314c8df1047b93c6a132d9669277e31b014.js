const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let currentRotation = 0;
const rotationSpeed = Phaser.Math.DegToRad(200); // 每秒 200 度转换为弧度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  hexagon = this.add.graphics();
  
  // 设置六边形的中心位置
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  hexagon.beginPath();
  
  // 计算六边形的六个顶点（从顶部开始，逆时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每个角 60 度，从顶部开始
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      hexagon.moveTo(x, y);
    } else {
      hexagon.lineTo(x, y);
    }
  }
  
  hexagon.closePath();
  hexagon.fillPath();
  
  // 设置六边形的位置（Graphics 的坐标系原点）
  hexagon.x = centerX;
  hexagon.y = centerY;
  
  // 添加提示文本
  this.add.text(10, 10, '六边形旋转速度: 200°/秒', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 根据 delta 时间计算旋转增量（delta 单位是毫秒）
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationDelta;
  
  // 更新六边形的旋转
  hexagon.setRotation(currentRotation);
}

new Phaser.Game(config);