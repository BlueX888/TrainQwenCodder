const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let cursors;
const SPEED = 240;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 定义菱形的四个顶点（中心为原点）
  const size = 32;
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];
  
  // 创建多边形并填充
  const polygon = new Phaser.Geom.Polygon(points);
  graphics.fillPoints(polygon.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamondTex', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建菱形精灵，初始位置在画布中心
  diamond = this.add.sprite(400, 300, 'diamondTex');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -distance;
  } else if (cursors.right.isDown) {
    velocityX = distance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -distance;
  } else if (cursors.down.isDown) {
    velocityY = distance;
  }
  
  // 更新菱形位置
  diamond.x += velocityX;
  diamond.y += velocityY;
  
  // 限制在画布边界内（考虑菱形的宽高）
  const halfWidth = diamond.width / 2;
  const halfHeight = diamond.height / 2;
  
  diamond.x = Phaser.Math.Clamp(diamond.x, halfWidth, config.width - halfWidth);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);