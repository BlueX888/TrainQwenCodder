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
  // 无需加载外部资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制三角形
    const graphics = this.add.graphics();
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 计算三角形的三个顶点坐标
    // 以点击位置为中心，绘制等边三角形
    const size = 80; // 三角形边长
    const height = size * Math.sqrt(3) / 2; // 等边三角形高度
    
    // 三个顶点相对于中心点的坐标
    const x = pointer.x;
    const y = pointer.y;
    
    // 顶点1（顶部）
    const x1 = x;
    const y1 = y - height * 2 / 3;
    
    // 顶点2（左下）
    const x2 = x - size / 2;
    const y2 = y + height / 3;
    
    // 顶点3（右下）
    const x3 = x + size / 2;
    const y3 = y + height / 3;
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 可选：添加描边使三角形更明显
    graphics.lineStyle(2, 0xFF8C00, 1);
    graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange triangles!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);