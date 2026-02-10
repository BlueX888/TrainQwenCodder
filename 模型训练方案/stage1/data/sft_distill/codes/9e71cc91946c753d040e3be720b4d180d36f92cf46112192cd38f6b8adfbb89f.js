const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = 40 + Math.cos(angle) * radius;
    const y = 40 + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.image(400, 300, 'starTexture');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算跟随速度（速度80表示每秒移动80像素）
  // delta 是毫秒，需要转换为秒
  const speed = 80;
  const factor = Math.min((speed * delta) / 1000, 1);
  
  // 使用线性插值实现平滑跟随
  star.x = Phaser.Math.Linear(star.x, pointer.x, factor);
  star.y = Phaser.Math.Linear(star.y, pointer.y, factor);
}

new Phaser.Game(config);