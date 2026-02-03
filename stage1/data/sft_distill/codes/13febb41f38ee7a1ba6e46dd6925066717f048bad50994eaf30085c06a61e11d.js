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
    
    // 设置橙色填充
    graphics.fillStyle(0xFFA500, 1);
    
    // 计算三角形的三个顶点（等边三角形）
    // 边长为 64 像素，中心在点击位置
    const size = 64;
    const height = (Math.sqrt(3) / 2) * size; // 等边三角形高度
    
    // 三个顶点相对于中心点的坐标
    const x1 = pointer.x;
    const y1 = pointer.y - (height * 2 / 3); // 顶部顶点
    
    const x2 = pointer.x - size / 2;
    const y2 = pointer.y + (height / 3); // 左下顶点
    
    const x3 = pointer.x + size / 2;
    const y3 = pointer.y + (height / 3); // 右下顶点
    
    // 绘制填充三角形
    graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
    
    // 可选：添加描边使三角形更明显
    graphics.lineStyle(2, 0xFF8C00, 1);
    graphics.strokeTriangle(x1, y1, x2, y2, x3, y3);
  });
  
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成橙色三角形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);