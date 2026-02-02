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
    
    // 计算三角形的三个顶点坐标（等边三角形，边长32像素）
    // 三角形中心在点击位置
    const size = 32;
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点相对于点击位置的偏移
    const x = pointer.x;
    const y = pointer.y;
    
    // 顶点坐标（顶点朝上的等边三角形）
    const x1 = x;                    // 顶部顶点
    const y1 = y - height * 2/3;
    
    const x2 = x - size / 2;         // 左下顶点
    const y2 = y + height * 1/3;
    
    const x3 = x + size / 2;         // 右下顶点
    const y3 = y + height * 1/3;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 20, 'Click anywhere to create red triangles', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5, 0);
}

new Phaser.Game(config);