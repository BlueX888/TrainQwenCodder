const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let diamond;
let cursors;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制菱形路径（中心点为 32, 32，大小为 32x32）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在画布中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置原点为中心（默认就是中心，但明确设置更清晰）
  diamond.setOrigin(0.5, 0.5);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;
  
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
  
  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新位置
  diamond.x += velocityX * moveDistance;
  diamond.y += velocityY * moveDistance;
  
  // 限制在画布边界内（考虑菱形的半宽和半高）
  const halfWidth = diamond.width / 2;
  const halfHeight = diamond.height / 2;
  
  diamond.x = Phaser.Math.Clamp(diamond.x, halfWidth, config.width - halfWidth);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);