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
  // 创建 Graphics 对象
  hexagon = this.add.graphics();
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  const radius = 80;
  const sides = 6;
  const centerX = 400;
  const centerY = 300;
  
  hexagon.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      hexagon.moveTo(x, y);
    } else {
      hexagon.lineTo(x, y);
    }
  }
  
  hexagon.closePath();
  hexagon.fillPath();
  
  // 设置旋转中心为六边形的中心
  hexagon.x = centerX;
  hexagon.y = centerY;
  
  // 由于我们已经在 centerX, centerY 位置绘制了六边形
  // 需要重新绘制，使其相对于原点 (0, 0) 绘制
  hexagon.clear();
  hexagon.fillStyle(0x00ff00, 1);
  hexagon.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
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
}

function update(time, delta) {
  // 每秒旋转 300 度
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = 300; // 度/秒
  const rotationRadians = Phaser.Math.DegToRad(rotationSpeed * delta / 1000);
  
  // 累加旋转角度
  hexagon.rotation += rotationRadians;
}

new Phaser.Game(config);