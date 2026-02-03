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
const SPEED = 240;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制菱形路径（中心在 32, 32，尺寸 64x64）
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
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新位置
  diamond.x += velocityX;
  diamond.y += velocityY;
  
  // 限制在画布边界内（考虑菱形的半径为 32）
  const halfSize = 32;
  diamond.x = Phaser.Math.Clamp(diamond.x, halfSize, config.width - halfSize);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfSize, config.height - halfSize);
}

new Phaser.Game(config);