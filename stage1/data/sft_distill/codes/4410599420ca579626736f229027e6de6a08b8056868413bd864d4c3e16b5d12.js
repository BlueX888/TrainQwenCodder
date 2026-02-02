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
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1); // 紫色
    
    // 计算菱形的四个顶点坐标（以点击点为中心，边长16像素）
    const centerX = pointer.x;
    const centerY = pointer.y;
    const halfSize = 8; // 16像素菱形的半径
    
    // 定义菱形的四个顶点（上、右、下、左）
    const points = [
      { x: centerX, y: centerY - halfSize },        // 上顶点
      { x: centerX + halfSize, y: centerY },        // 右顶点
      { x: centerX, y: centerY + halfSize },        // 下顶点
      { x: centerX - halfSize, y: centerY }         // 左顶点
    ];
    
    // 开始绘制路径
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    
    // 闭合路径
    graphics.closePath();
    
    // 填充菱形
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create purple diamonds', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);