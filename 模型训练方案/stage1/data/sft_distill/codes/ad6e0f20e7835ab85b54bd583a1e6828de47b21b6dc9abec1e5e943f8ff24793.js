const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
const rotationSpeed = 160; // 每秒旋转 160 度

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  hexagon = this.add.graphics();
  
  // 设置填充颜色
  hexagon.fillStyle(0x00ff00, 1);
  
  // 绘制六边形（中心在原点）
  const radius = 80;
  const sides = 6;
  
  hexagon.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i;
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
  hexagon.x = 400;
  hexagon.y = 300;
}

function update(time, delta) {
  // 根据 delta 时间计算旋转增量
  // delta 单位是毫秒，需要转换为秒
  const rotationIncrement = Phaser.Math.DegToRad(rotationSpeed * (delta / 1000));
  
  // 累加旋转角度
  hexagon.rotation += rotationIncrement;
}

new Phaser.Game(config);