const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangle;
let cursors;
const SPEED = 80;

function preload() {
  // 创建粉色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制一个等边三角形，中心点在 (25, 25)
  graphics.fillTriangle(
    25, 5,    // 顶点
    5, 45,    // 左下
    45, 45    // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，位置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧的移动距离
  const velocity = SPEED * (delta / 1000);
  
  // 重置速度
  let dx = 0;
  let dy = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    dx = -velocity;
  } else if (cursors.right.isDown) {
    dx = velocity;
  }
  
  if (cursors.up.isDown) {
    dy = -velocity;
  } else if (cursors.down.isDown) {
    dy = velocity;
  }
  
  // 更新位置
  triangle.x += dx;
  triangle.y += dy;
  
  // 限制在画布边界内
  // 考虑三角形的宽度和高度（50x50）
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

new Phaser.Game(config);