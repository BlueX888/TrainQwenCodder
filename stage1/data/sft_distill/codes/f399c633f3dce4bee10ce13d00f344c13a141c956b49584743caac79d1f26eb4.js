const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

function preload() {
  // 无需预加载资源
}

let star;

function create() {
  // 创建 Graphics 对象绘制星形
  star = this.add.graphics();
  
  // 设置填充颜色为金黄色
  star.fillStyle(0xffdd00, 1);
  
  // 绘制五角星
  const centerX = 400;
  const centerY = 300;
  const outerRadius = 80;  // 外半径
  const innerRadius = 35;  // 内半径
  const points = 5;        // 五角星
  
  star.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      star.moveTo(x, y);
    } else {
      star.lineTo(x, y);
    }
  }
  
  star.closePath();
  star.fillPath();
  
  // 添加描边使星形更明显
  star.lineStyle(3, 0xff8800, 1);
  star.strokePath();
}

function update(time, delta) {
  // 每秒旋转 120 度 = 120 * (Math.PI / 180) = 2.0944 弧度
  // delta 是毫秒，转换为秒需要除以 1000
  const rotationSpeed = (120 * Math.PI / 180); // 弧度每秒
  
  // 更新旋转角度
  star.rotation += rotationSpeed * (delta / 1000);
  
  // 可选：限制角度在 0-2π 范围内，避免数值过大
  if (star.rotation > Math.PI * 2) {
    star.rotation -= Math.PI * 2;
  }
}

new Phaser.Game(config);