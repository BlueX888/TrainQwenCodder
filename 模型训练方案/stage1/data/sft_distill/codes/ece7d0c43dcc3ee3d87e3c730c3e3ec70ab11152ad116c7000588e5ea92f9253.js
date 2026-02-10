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
    // 获取点击位置
    const x = pointer.x;
    const y = pointer.y;
    
    // 创建 Graphics 对象用于绘制菱形
    const graphics = this.add.graphics();
    
    // 设置青色填充样式 (cyan: #00FFFF)
    graphics.fillStyle(0x00FFFF, 1);
    
    // 计算菱形的四个顶点（80像素表示对角线长度为80）
    // 每个方向延伸40像素
    const size = 40;
    const top = { x: x, y: y - size };      // 上顶点
    const right = { x: x + size, y: y };    // 右顶点
    const bottom = { x: x, y: y + size };   // 下顶点
    const left = { x: x - size, y: y };     // 左顶点
    
    // 创建菱形路径
    const diamond = new Phaser.Geom.Polygon([
      top.x, top.y,
      right.x, right.y,
      bottom.x, bottom.y,
      left.x, left.y
    ]);
    
    // 填充菱形
    graphics.fillPoints(diamond.points, true);
    
    // 可选：添加边框使菱形更明显
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.strokePoints(diamond.points, true);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create a cyan diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);