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

let triangle;
let cursors;
const SPEED = 360;

function preload() {
  // 使用 Graphics 生成灰色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制一个指向上方的三角形
  // 三角形中心点在 (25, 25)，大小为 50x50
  graphics.fillTriangle(
    25, 5,   // 顶点（上）
    5, 45,   // 左下顶点
    45, 45   // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  
  // 销毁 graphics 对象释放内存
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
  }
  
  if (cursors.up.isDown) {
    velocityY = -SPEED;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
  }
  
  // 更新三角形位置
  triangle.x += velocityX * deltaInSeconds;
  triangle.y += velocityY * deltaInSeconds;
  
  // 边界限制
  const halfWidth = triangle.width / 2;
  const halfHeight = triangle.height / 2;
  
  // 限制 X 坐标在画布范围内
  if (triangle.x - halfWidth < 0) {
    triangle.x = halfWidth;
  } else if (triangle.x + halfWidth > config.width) {
    triangle.x = config.width - halfWidth;
  }
  
  // 限制 Y 坐标在画布范围内
  if (triangle.y - halfHeight < 0) {
    triangle.y = halfHeight;
  } else if (triangle.y + halfHeight > config.height) {
    triangle.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);