const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;

function preload() {
  // 创建黄色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const size = 30; // 六边形大小
  const points = [];
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = size + Math.cos(angle) * size;
    const y = size + Math.sin(angle) * size;
    points.push(new Phaser.Geom.Point(x, y));
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0xFFFF00, 1); // 黄色
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy();
}

function create() {
  // 创建六边形精灵，初始位置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算跟随速度（速度80意味着每秒移动的像素数）
  // delta 是毫秒，需要转换为秒
  const speed = 80;
  const factor = Math.min(1, (speed * delta) / 1000);
  
  // 使用线性插值实现平滑跟随
  hexagon.x = Phaser.Math.Linear(hexagon.x, pointer.x, factor);
  hexagon.y = Phaser.Math.Linear(hexagon.y, pointer.y, factor);
}

new Phaser.Game(config);