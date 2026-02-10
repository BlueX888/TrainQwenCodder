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
  // 使用 Graphics 创建灰色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制一个指向上方的三角形（中心点在 (25, 25)）
  graphics.fillTriangle(
    25, 10,  // 顶点
    10, 40,  // 左下角
    40, 40   // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置三角形的原点为中心
  triangle.setOrigin(0.5, 0.5);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 保存当前位置用于边界检测
  let newX = triangle.x;
  let newY = triangle.y;
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    newX -= distance;
    triangle.setAngle(-90); // 旋转三角形指向左
  } else if (cursors.right.isDown) {
    newX += distance;
    triangle.setAngle(90); // 旋转三角形指向右
  }
  
  if (cursors.up.isDown) {
    newY -= distance;
    triangle.setAngle(0); // 旋转三角形指向上
  } else if (cursors.down.isDown) {
    newY += distance;
    triangle.setAngle(180); // 旋转三角形指向下
  }
  
  // 边界检测 - 限制在画布范围内
  // 考虑三角形的宽高（50x50）和原点在中心
  const halfWidth = 25;
  const halfHeight = 25;
  
  newX = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  newY = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
  
  // 应用新位置
  triangle.x = newX;
  triangle.y = newY;
}

new Phaser.Game(config);