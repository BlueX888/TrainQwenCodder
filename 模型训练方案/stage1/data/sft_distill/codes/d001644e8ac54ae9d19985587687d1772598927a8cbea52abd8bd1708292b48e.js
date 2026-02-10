const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let star;
let targetX = 400;
let targetY = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制五角星
  const points = [];
  const outerRadius = 30;
  const innerRadius = 12;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 40 + Math.cos(angle) * radius,
      y: 40 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  graphics.destroy();
  
  // 创建星形精灵
  star = this.add.sprite(400, 300, 'star');
  
  // 监听鼠标移动
  this.input.on('pointermove', (pointer) => {
    targetX = pointer.x;
    targetY = pointer.y;
  });
  
  // 初始化目标位置为鼠标当前位置
  targetX = this.input.activePointer.x;
  targetY = this.input.activePointer.y;
}

function update(time, delta) {
  // 计算跟随速度（速度 = 80 像素/秒）
  // delta 是毫秒，需要转换为秒
  const speed = 80;
  const factor = Math.min(1, (speed * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  star.x = Phaser.Math.Linear(star.x, targetX, factor);
  star.y = Phaser.Math.Linear(star.y, targetY, factor);
}

new Phaser.Game(config);