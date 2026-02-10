const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制三角形
    const graphics = this.add.graphics();
    
    // 设置填充颜色为红色
    graphics.fillStyle(0xff0000, 1);
    
    // 计算三角形的三个顶点坐标
    // 等边三角形，尺寸24像素，以点击位置为中心
    const size = 24;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    const x = pointer.x;
    const y = pointer.y;
    
    // 三个顶点：顶部、左下、右下
    const x1 = x;
    const y1 = y - height * 2 / 3; // 顶点
    
    const x2 = x - size / 2;
    const y2 = y + height / 3; // 左下
    
    const x3 = x + size / 2;
    const y3 = y + height / 3; // 右下
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
}

new Phaser.Game(config);