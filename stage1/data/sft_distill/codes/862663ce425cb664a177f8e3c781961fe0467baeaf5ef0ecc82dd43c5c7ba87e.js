const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangle;
let cursors;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制一个等腰三角形（顶点朝上）
  // 中心点在 (16, 16)，三角形大小约 32x32
  graphics.fillTriangle(
    16, 4,      // 顶点
    4, 28,      // 左下角
    28, 28      // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 32, 32);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧的移动距离
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键状态更新位置
  let newX = triangle.x;
  let newY = triangle.y;
  
  if (cursors.left.isDown) {
    newX -= distance;
  }
  if (cursors.right.isDown) {
    newX += distance;
  }
  if (cursors.up.isDown) {
    newY -= distance;
  }
  if (cursors.down.isDown) {
    newY += distance;
  }
  
  // 限制在画布边界内（考虑三角形的宽高为32）
  const halfWidth = 16;
  const halfHeight = 16;
  
  triangle.x = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  triangle.y = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);