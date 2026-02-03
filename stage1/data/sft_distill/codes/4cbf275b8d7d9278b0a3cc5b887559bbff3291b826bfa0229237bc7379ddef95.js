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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制一个向上的三角形（中心点在 (0, 0)）
  graphics.fillTriangle(
    0, -20,    // 顶点
    -15, 20,   // 左下角
    15, 20     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建三角形精灵，放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧移动距离
  const moveDistance = SPEED * deltaInSeconds;
  
  // 根据方向键状态更新位置
  if (cursors.left.isDown) {
    triangle.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    triangle.x += moveDistance;
  }
  if (cursors.up.isDown) {
    triangle.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    triangle.y += moveDistance;
  }
  
  // 限制三角形在画布边界内
  // 考虑三角形的宽度和高度（30x40）
  const halfWidth = 15;
  const halfHeight = 20;
  
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