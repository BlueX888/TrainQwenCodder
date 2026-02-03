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
    // 创建 Graphics 对象
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9932cc, 1); // 紫色
    
    // 绘制菱形路径
    // 菱形是由4个顶点构成的多边形
    // 以点击位置为中心，边长16像素
    const centerX = pointer.x;
    const centerY = pointer.y;
    const halfSize = 8; // 16像素菱形的半径
    
    // 创建菱形路径（上、右、下、左四个顶点）
    const diamond = new Phaser.Geom.Polygon([
      centerX, centerY - halfSize,           // 上顶点
      centerX + halfSize, centerY,           // 右顶点
      centerX, centerY + halfSize,           // 下顶点
      centerX - halfSize, centerY            // 左顶点
    ]);
    
    // 填充菱形
    graphics.fillPoints(diamond.points, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create purple diamonds', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);