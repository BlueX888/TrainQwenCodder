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

let triangle;
let cursors;
const SPEED = 360;

function preload() {
  // 使用 Graphics 创建灰色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制三角形 (向上的等腰三角形)
  // 中心点在 (32, 32)，三角形顶点坐标
  graphics.fillTriangle(
    32, 10,   // 顶点
    10, 54,   // 左下角
    54, 54    // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 64, 64);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离 (速度 * 时间差，转换为秒)
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
  
  // 更新位置
  triangle.x += velocityX;
  triangle.y += velocityY;
  
  // 限制在画布边界内
  // 考虑三角形的宽度和高度（纹理大小为 64x64）
  const halfWidth = triangle.width / 2;
  const halfHeight = triangle.height / 2;
  
  triangle.x = Phaser.Math.Clamp(
    triangle.x,
    halfWidth,
    config.width - halfWidth
  );
  
  triangle.y = Phaser.Math.Clamp(
    triangle.y,
    halfHeight,
    config.height - halfHeight
  );
}

// 启动游戏
new Phaser.Game(config);