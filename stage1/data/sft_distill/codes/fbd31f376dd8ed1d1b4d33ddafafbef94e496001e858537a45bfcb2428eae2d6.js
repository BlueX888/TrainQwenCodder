const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置灰色填充样式
    graphics.fillStyle(0x808080, 1);
    
    // 计算菱形的四个顶点坐标（16像素对角线，半径8像素）
    const x = pointer.x;
    const y = pointer.y;
    const size = 8; // 半径
    
    // 菱形顶点：上、右、下、左
    const points = [
      x, y - size,  // 上顶点
      x + size, y,  // 右顶点
      x, y + size,  // 下顶点
      x - size, y   // 左顶点
    ];
    
    // 绘制填充菱形
    graphics.beginPath();
    graphics.moveTo(points[0], points[1]);
    graphics.lineTo(points[2], points[3]);
    graphics.lineTo(points[4], points[5]);
    graphics.lineTo(points[6], points[7]);
    graphics.closePath();
    graphics.fillPath();
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a gray diamond', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);