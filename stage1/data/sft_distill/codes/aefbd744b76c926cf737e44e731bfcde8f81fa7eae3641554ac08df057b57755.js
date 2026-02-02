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
let cursors;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制橙色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 绘制菱形路径（中心在原点）
  const size = 32;
  const path = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在画布中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键输入移动菱形
  if (cursors.left.isDown) {
    diamond.x -= distance;
  }
  if (cursors.right.isDown) {
    diamond.x += distance;
  }
  if (cursors.up.isDown) {
    diamond.y -= distance;
  }
  if (cursors.down.isDown) {
    diamond.y += distance;
  }
  
  // 限制菱形在画布边界内
  const halfWidth = diamond.width / 2;
  const halfHeight = diamond.height / 2;
  
  diamond.x = Phaser.Math.Clamp(diamond.x, halfWidth, config.width - halfWidth);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);