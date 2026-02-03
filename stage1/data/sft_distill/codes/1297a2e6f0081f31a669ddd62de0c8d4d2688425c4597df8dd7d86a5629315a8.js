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
  // 使用 Graphics 生成灰色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制灰色三角形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 记录当前位置
  let newX = triangle.x;
  let newY = triangle.y;
  
  // 检测方向键输入并更新位置
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
  
  // 限制在画布边界内
  // 考虑三角形的宽度和高度（50x50）
  const halfWidth = 25;
  const halfHeight = 25;
  
  newX = Phaser.Math.Clamp(newX, halfWidth, config.width - halfWidth);
  newY = Phaser.Math.Clamp(newY, halfHeight, config.height - halfHeight);
  
  // 更新三角形位置
  triangle.setPosition(newX, newY);
}

new Phaser.Game(config);