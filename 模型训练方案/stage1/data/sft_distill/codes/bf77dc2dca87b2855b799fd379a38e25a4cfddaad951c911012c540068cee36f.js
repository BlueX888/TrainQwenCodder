const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let diamond;
let cursors;
const SPEED = 300;

function preload() {
  // 创建橙色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制菱形路径 (中心点为 25, 25，边长约50)
  const path = new Phaser.Geom.Polygon([
    25, 0,    // 上顶点
    50, 25,   // 右顶点
    25, 50,   // 下顶点
    0, 25     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在画布中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新位置
  diamond.x += velocityX * distance;
  diamond.y += velocityY * distance;
  
  // 限制在画布边界内（考虑菱形宽高为50）
  const halfWidth = 25;
  const halfHeight = 25;
  
  diamond.x = Phaser.Math.Clamp(diamond.x, halfWidth, config.width - halfWidth);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);