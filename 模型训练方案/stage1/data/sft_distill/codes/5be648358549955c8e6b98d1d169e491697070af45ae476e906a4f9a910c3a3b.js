const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let diamond;
let velocityX = 80;
let velocityY = 80;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  
  // 定义菱形的四个顶点（中心在32,32，边长约45像素）
  const points = [
    { x: 32, y: 2 },   // 上顶点
    { x: 62, y: 32 },  // 右顶点
    { x: 32, y: 62 },  // 下顶点
    { x: 2, y: 32 }    // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵并设置初始位置
  diamond = this.add.sprite(400, 300, 'diamondTexture');
}

function update(time, delta) {
  // 计算每帧移动距离（delta 是毫秒，需要转换为秒）
  const deltaSeconds = delta / 1000;
  const moveX = velocityX * deltaSeconds;
  const moveY = velocityY * deltaSeconds;
  
  // 更新位置
  diamond.x += moveX;
  diamond.y += moveY;
  
  // 获取菱形的边界（考虑纹理大小）
  const halfWidth = diamond.width / 2;
  const halfHeight = diamond.height / 2;
  
  // 检测左右边界碰撞
  if (diamond.x - halfWidth <= 0) {
    diamond.x = halfWidth;
    velocityX = Math.abs(velocityX); // 向右反弹
  } else if (diamond.x + halfWidth >= config.width) {
    diamond.x = config.width - halfWidth;
    velocityX = -Math.abs(velocityX); // 向左反弹
  }
  
  // 检测上下边界碰撞
  if (diamond.y - halfHeight <= 0) {
    diamond.y = halfHeight;
    velocityY = Math.abs(velocityY); // 向下反弹
  } else if (diamond.y + halfHeight >= config.height) {
    diamond.y = config.height - halfHeight;
    velocityY = -Math.abs(velocityY); // 向上反弹
  }
}

new Phaser.Game(config);